create type "public"."invoice_task_type" as enum ('ocr');

create type "public"."payment_providers" as enum ('stripe');

create type "public"."subscription_provider" as enum ('stripe');

create type "public"."subscription_status" as enum ('inactive', 'trialing', 'active', 'past_due', 'canceled');

drop trigger if exists "on_upload_validation_done" on "public"."upload_validations";

drop policy "Allow ALL to own user" on "public"."upload_validations";

drop policy "Allow SELECT to same establishment member" on "public"."users";

alter table "public"."upload_validations" drop constraint "upload_validations_selected_establishment_fkey";

alter table "public"."upload_validations" drop constraint "upload_validations_uploader_id_fkey";

drop function if exists "public"."on_upload_file"();

drop view if exists "public"."invoices_with_establishment";

alter table "public"."ocr_http_logs" drop constraint "ocr_http_logs_pkey";

alter table "public"."upload_validations" drop constraint "upload_validation_pkey";

drop index if exists "public"."ocr_http_logs_pkey";

drop index if exists "public"."upload_validation_pkey";

drop table "public"."ocr_http_logs";

drop table "public"."upload_validations";

alter table "public"."invoices" alter column "status" drop default;

alter type "public"."invoices_status" rename to "invoices_status__old_version_to_be_dropped";

create type "public"."invoices_status" as enum ('draft', 'processing', 'ocr', 'pending', 'sent', 'validated', 'paid', 'error');

create table "public"."guest_upload_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "sender_email" text not null,
    "verification_token_hash" text not null,
    "expires_at" timestamp with time zone not null default (now() + '01:00:00'::interval),
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."guest_upload_sessions" enable row level security;

create table "public"."subscriptions" (
    "created_at" timestamp with time zone not null default now(),
    "establishment_id" uuid not null,
    "started_at" timestamp with time zone not null,
    "end_at" timestamp with time zone,
    "provider_customer_id" text not null,
    "provider_subscription_id" text not null,
    "status" subscription_status not null default 'inactive'::subscription_status,
    "provider" payment_providers not null default 'stripe'::payment_providers
);


alter table "public"."subscriptions" enable row level security;

alter table "public"."invoices" alter column status type "public"."invoices_status" using status::text::"public"."invoices_status";

alter table "public"."invoices" alter column "status" set default 'pending'::invoices_status;

drop type "public"."invoices_status__old_version_to_be_dropped";

alter table "public"."establishments" alter column "email_prefix" set not null;

alter table "public"."invoice_jobs" drop column "ocr_provider";

alter table "public"."invoice_jobs" add column "provider" ocr_providers not null default 'mindee'::ocr_providers;

alter table "public"."invoice_jobs" add column "type" invoice_task_type not null default 'ocr'::invoice_task_type;

alter table "public"."invoice_jobs" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."invoice_jobs" alter column "invoice_id" set not null;

drop sequence if exists "public"."ocr_http_logs_id_seq";

CREATE UNIQUE INDEX guest_upload_sessions_pkey ON public.guest_upload_sessions USING btree (id);

CREATE INDEX idx_guest_upload_sessions_email ON public.guest_upload_sessions USING btree (sender_email);

CREATE INDEX idx_guest_upload_sessions_expires ON public.guest_upload_sessions USING btree (expires_at);

CREATE UNIQUE INDEX subscriptions_establishment_id_key ON public.subscriptions USING btree (establishment_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (establishment_id);

alter table "public"."guest_upload_sessions" add constraint "guest_upload_sessions_pkey" PRIMARY KEY using index "guest_upload_sessions_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_establishment_id_fkey" FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_establishment_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_establishment_id_key" UNIQUE using index "subscriptions_establishment_id_key";

set check_function_bodies = off;

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

create or replace view "public"."invoices_with_establishment" as  SELECT i.id,
    i.supplier_id,
    i.invoice_number,
    i.amount,
    i.status,
    i.created_at,
    i.updated_at,
    i.name,
    i.comment,
    i.file_path,
    s.name AS supplier_name,
    s.establishment_id,
    i.due_date,
        CASE
            WHEN ((i.status <> 'paid'::invoices_status) AND (i.due_date < now())) THEN true
            ELSE false
        END AS overdue,
    i.paid_at
   FROM (invoices i
     JOIN suppliers s ON ((i.supplier_id = s.id)));


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

create policy "Allow ALL to establishment members"
on "public"."establishment_members"
as permissive
for all
to authenticated
using (is_auth_member_of_establishment(establishment_id, true));


create policy "Allow anonymous insert"
on "public"."guest_upload_sessions"
as permissive
for insert
to anon
with check (true);


create policy "Allow read own session"
on "public"."guest_upload_sessions"
as permissive
for select
to anon
using (true);


create policy "Allow update own session"
on "public"."guest_upload_sessions"
as permissive
for update
to anon
using (((verified_at IS NULL) AND (expires_at > now())));


create policy "Allow ALL to establishment members"
on "public"."subscriptions"
as permissive
for all
to authenticated
using (is_auth_member_of_establishment(establishment_id, true))
with check (is_auth_member_of_establishment(establishment_id, true));


create policy "Allow SELECT for all members"
on "public"."subscriptions"
as permissive
for select
to authenticated
using (is_auth_member_of_establishment(establishment_id, true));


create policy "Allow SELECT to same establishment member"
on "public"."users"
as permissive
for select
to authenticated
using (is_user_same_establishment(auth.uid(), id, false));




  create policy "Allow SELECT own user"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow INSERT own user"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow UPDATE own user"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow DELETE own user"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



