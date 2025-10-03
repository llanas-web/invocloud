create extension if not exists "unaccent" with schema "public" version '1.1';

create type "public"."invoice_job_status" as enum ('queued', 'submitted', 'done', 'error');

create type "public"."invoice_sources" as enum ('upload', 'email', 'app');

create type "public"."ocr_providers" as enum ('mindee');

create sequence "public"."ocr_http_logs_id_seq";

drop view if exists "public"."invoices_with_establishment";

alter table "public"."invoices" alter column "status" drop default;

alter type "public"."invoices_status" rename to "invoices_status__old_version_to_be_dropped";

create type "public"."invoices_status" as enum ('ocr', 'pending', 'sent', 'validated', 'paid', 'error');

create table "public"."invoice_jobs" (
    "created_at" timestamp with time zone not null default now(),
    "job_id" uuid default gen_random_uuid(),
    "invoice_id" uuid default gen_random_uuid(),
    "status" invoice_job_status not null default 'queued'::invoice_job_status,
    "ocr_provider" ocr_providers not null default 'mindee'::ocr_providers,
    "raw_result" text,
    "attempts" smallint not null default '0'::smallint,
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."invoice_jobs" enable row level security;

create table "public"."ocr_http_logs" (
    "id" bigint not null default nextval('ocr_http_logs_id_seq'::regclass),
    "created_at" timestamp with time zone not null default now(),
    "invoice_id" uuid,
    "job_id" uuid,
    "status_code" integer,
    "ok" boolean,
    "error" text,
    "response" jsonb
);


alter table "public"."invoices" alter column status type "public"."invoices_status" using status::text::"public"."invoices_status";

alter table "public"."invoices" alter column "status" set default 'pending'::invoices_status;

drop type "public"."invoices_status__old_version_to_be_dropped";

alter table "public"."establishments" add column "email_prefix" text;

alter table "public"."invoices" add column "emit_date" timestamp with time zone not null default now();

alter table "public"."invoices" add column "source" invoice_sources not null default 'app'::invoice_sources;

alter sequence "public"."ocr_http_logs_id_seq" owned by "public"."ocr_http_logs"."id";

CREATE UNIQUE INDEX invoice_jobs_pkey ON public.invoice_jobs USING btree (id);

CREATE UNIQUE INDEX ocr_http_logs_pkey ON public.ocr_http_logs USING btree (id);

CREATE UNIQUE INDEX ux_establishments_email_prefix ON public.establishments USING btree (email_prefix);

alter table "public"."invoice_jobs" add constraint "invoice_jobs_pkey" PRIMARY KEY using index "invoice_jobs_pkey";

alter table "public"."ocr_http_logs" add constraint "ocr_http_logs_pkey" PRIMARY KEY using index "ocr_http_logs_pkey";

alter table "public"."establishments" add constraint "establishments_email_prefix_format" CHECK ((email_prefix ~ '^[a-z0-9]+([-_][a-z0-9]+)*$'::text)) not valid;

alter table "public"."establishments" validate constraint "establishments_email_prefix_format";

alter table "public"."invoice_jobs" add constraint "invoice_jobs_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoice_jobs" validate constraint "invoice_jobs_invoice_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enqueue_invoice_job_from_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  -- On ne queue que pour 'email' ou 'upload'
  if NEW.source not in ('email','upload') then
    return NEW;
  end if;

  -- Évite doublons (unique(invoice_id) protège aussi)
  if exists(select 1 from public.invoice_jobs where invoice_id = NEW.id) then
    return NEW;
  end if;

  insert into public.invoice_jobs(invoice_id, ocr_provider)
  values (NEW.id, 'mindee');

  return NEW;
end;$function$
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

CREATE OR REPLACE FUNCTION public.on_upload_file()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  selected_supplier_id uuid;
BEGIN
  IF (NEW.status = 'uploaded') THEN

    SELECT id
    INTO selected_supplier_id
    FROM public.suppliers
    WHERE suppliers.establishment_id = NEW.selected_establishment
      AND suppliers.id = ANY(NEW.suppliers); -- assuming NEW.suppliers is uuid[]

    INSERT INTO public.invoices (
      id,
      supplier_id,
      comment,
      file_path,
      name
    ) VALUES (
      NEW.id, 
      selected_supplier_id,
      NEW.comment,
      NEW.file_path,
      NEW.file_name
    );

  END IF;

  NEW.status = 'done';
  RETURN NEW;
END;$function$
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

CREATE TRIGGER trg_set_email_prefix BEFORE INSERT ON public.establishments FOR EACH ROW EXECUTE FUNCTION set_email_prefix_on_insert();

CREATE TRIGGER trg_enqueue_invoice_job_from_invoice AFTER INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION enqueue_invoice_job_from_invoice();


