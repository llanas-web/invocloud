drop extension if exists "pg_net";

drop trigger if exists "trg_set_email_prefix" on "public"."establishments";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_sender_authorized(recipient_email text, sender_email text)
 RETURNS TABLE(supplier_id uuid, establishment_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
  select suppliers.id as supplier_id, establishments.id as establishment_id
  from public.suppliers
  join public.establishments
    on establishments.id = suppliers.establishment_id
  join public.establishment_members
    on establishment_members.establishment_id = establishments.id
  join public.users
    on establishment_members.user_id = users.id
  where users.email = recipient_email
  and sender_email = any(suppliers.emails);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.clean_expired_guest_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  delete from public.guest_upload_sessions
  where expires_at < now() - interval '24 hours';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.enqueue_invoice_job_from_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  -- On ne queue que pour 'email' ou 'upload'
  if NEW.source not in ('email', 'upload', 'app') then
    return NEW;
  end if;

  if NEW.status in ('draft') then
    -- Évite doublons (unique(invoice_id) protège aussi)
    if exists(select 1 from public.invoice_jobs where invoice_id = NEW.id) then
      return NEW;
    end if;

    insert into public.invoice_jobs(invoice_id, type, provider)
    values (NEW.id, 'ocr', 'mindee');

    return NEW;
  end if;
  return NEW;
end;$function$
;

CREATE OR REPLACE FUNCTION public.establishment_has_active_subscription(establishment_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select coalesce(e.subscription_status in ('trialing','active','past_due','unpaid'), false)
  from public.establishments e
  where e.id = establishment_id
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_establishment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  INSERT INTO public.establishment_members (establishment_id, user_id, status, role)
  VALUES (
    NEW.id,
    NEW.creator_id,
    'accepted',
    'admin'
  );
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  new_establishment_id uuid;
BEGIN
  IF (NEW.is_anonymous = false) THEN
    -- Insert into users table
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
    );

    -- Handle invitation-based join
    IF (NEW.raw_user_meta_data->>'establishment_id') IS NOT NULL THEN
      new_establishment_id := (NEW.raw_user_meta_data->>'establishment_id')::uuid;

      INSERT INTO public.establishment_members (establishment_id, user_id)
      VALUES (
        new_establishment_id,
        NEW.id
      );

    -- Handle creation of a new establishment
    ELSIF (NEW.raw_user_meta_data->>'establishment_name') IS NOT NULL THEN
      INSERT INTO public.establishments (name, creator_id)
      VALUES (
        NEW.raw_user_meta_data->>'establishment_name',
        NEW.id
      )
      RETURNING id INTO new_establishment_id;
    END IF;

    -- Insert user settings with favorite establishment
    INSERT INTO public.user_settings (user_id, favorite_establishment_id)
    VALUES (
      NEW.id,
      new_establishment_id
    );
  END IF;

  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_auth_member_of_establishment(_establishment_id uuid, _accepted_only boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  _res boolean;
begin
  select exists (
    select 1
    from public.establishment_members em
    where em.establishment_id = _establishment_id
      and em.user_id = auth.uid()
      and (_accepted_only is false or em.status = 'accepted')
  )
  into _res;

  return coalesce(_res, false);
end;$function$
;

CREATE OR REPLACE FUNCTION public.is_auth_member_of_supplier(_supplier_id uuid, _accepted_only boolean)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$declare
  _res boolean;
begin
  select exists (
    select 1
    from public.suppliers s
    join public.establishment_members em
      on em.establishment_id = s.establishment_id
    where s.id = _supplier_id
      and em.user_id = auth.uid()
      and (_accepted_only is false or em.status = 'accepted')
  )
  into _res;

  return coalesce(_res, false);
end;$function$
;

CREATE OR REPLACE FUNCTION public.is_auth_user_allowed_establishment(_establishment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN EXISTS(
    SELECT 1
    FROM public.establishments
    WHERE establishments.creator_id = auth.uid()
  );
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_auth_user_establishment_creator(_establishment_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE 
  establishment_count int;

BEGIN
  RAISE LOG 'Is % the creator of %', auth.uid(), _establishment_id;
  
  SELECT COUNT(*) INTO establishment_count    
  FROM establishments
  WHERE challenges.id = _establishment_id AND challenges.creator_id = auth.uid();
  
  RAISE LOG 'There is % establishment', challenge_count;

  RETURN establishment_count > 0;
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_user_same_establishment(_user_a uuid, _user_b uuid, _accepted_only boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE _res boolean;
BEGIN
select exists (
    select 1
    from public.establishment_members em1
    join public.establishment_members em2
      on em1.establishment_id = em2.establishment_id
    where em1.user_id = _user_a
      and em2.user_id = _user_b
      and (_accepted_only is false
           or (em1.status = 'accepted' and em2.status = 'accepted'))
  )
  into _res;

  return coalesce(_res, false);
END;$function$
;

CREATE OR REPLACE FUNCTION public.make_email_prefix(src text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select regexp_replace(
           regexp_replace(
             lower(unaccent(coalesce(src, ''))),
             '[^a-z0-9]+', '-', 'g'                -- non-alphanum -> '-'
           ),
           '(^-|-$)', '', 'g'                      -- trim '-'
         )
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_delete_establishment_if_active()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if public.establishment_has_active_subscription(old.id) then
    raise exception 'Impossible de supprimer cet établissement: un abonnement Stripe est encore actif. Annulez l’abonnement puis réessayez.';
  end if;
  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_delete_user_if_active_sub()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if public.user_has_active_billing_establishments(old.id) then
    raise exception 'Impossible de supprimer votre compte: au moins un de vos établissements a un abonnement Stripe actif. Annulez d’abord l’abonnement via la page Abonnement, puis réessayez.';
  end if;
  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_email_prefix_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  base text;
  try text;
  i int := 1;
begin
  if new.email_prefix is not null then
    return new;
  end if;

  base := make_email_prefix(new.name);
  if base = '' then base := 'etablissement'; end if;
  try := base;

  while exists(select 1 from public.establishments where email_prefix = try) loop
    i := i + 1;
    try := base || '-' || i;
  end loop;

  new.email_prefix := try;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.user_has_active_billing_establishments(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from public.establishments e
    where e.creator_id = user_id
      and public.establishment_has_active_subscription(e.id)
  )
$function$
;


  create policy "Give users access to own folder aj13hi_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Give users access to own folder aj13hi_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Give users access to own folder aj13hi_2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Give users access to own folder aj13hi_3"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



