create extension if not exists "pg_cron" with schema "pg_catalog";

create extension if not exists "pg_net" with schema "extensions";

drop extension if exists "pgjwt";

drop trigger if exists "trg_prevent_delete_establishment_if_active" on "public"."establishments";

drop trigger if exists "trg_prevent_delete_user_if_active_sub" on "public"."users";

drop policy if exists "Allow SELECT for all members" on "public"."subscriptions";

drop policy if exists "Allow ALL to establishment members" on "public"."subscriptions";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_establishment_id_fkey'
  ) THEN
    ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_establishment_id_fkey";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_establishment_id_key'
  ) THEN
    ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_establishment_id_key";
  END IF;
END $$;

drop function if exists "public"."establishment_has_active_subscription"(establishment_id uuid);

drop function if exists "public"."prevent_delete_establishment_if_active"();

drop function if exists "public"."prevent_delete_user_if_active_sub"();

drop function if exists "public"."user_has_active_billing_establishments"(user_id uuid);

drop view if exists "public"."invoices_with_establishment";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_pkey'
  ) THEN
    ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_pkey";
  END IF;
END $$;

drop index if exists "public"."subscriptions_establishment_id_key";

drop index if exists "public"."subscriptions_pkey";

alter table "public"."establishment_members" alter column "role" drop default;

alter type "public"."establishment_member_role" rename to "establishment_member_role__old_version_to_be_dropped";

create type "public"."establishment_member_role" as enum ('creator', 'admin', 'owner');

-- Note: subscription_plans est déjà créée dans 20260114143519_prepare_data_for_subscription_migration.sql
-- On ne la recrée pas ici

alter table "public"."establishment_members" alter column role type "public"."establishment_member_role" using role::text::"public"."establishment_member_role";

alter table "public"."establishment_members" alter column "role" set default 'admin'::public.establishment_member_role;

drop type "public"."establishment_member_role__old_version_to_be_dropped";

alter table "public"."establishments" drop column "stripe_customer_id";

alter table "public"."establishments" drop column "stripe_subscription_id";

alter table "public"."establishments" drop column "subscription_end";

alter table "public"."establishments" drop column "subscription_start";

alter table "public"."establishments" drop column "subscription_status";

alter table "public"."establishments" drop column "trial_end";

alter table "public"."invoices" add column "has_been_measured" boolean not null default false;

-- Supprimer establishment_id seulement si la colonne existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
      AND column_name = 'establishment_id'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."subscriptions" DROP COLUMN "establishment_id";
    RAISE NOTICE 'Colonne establishment_id supprimée de subscriptions';
  ELSE
    RAISE NOTICE 'Colonne establishment_id n''existe déjà plus dans subscriptions';
  END IF;
END $$;

-- Note: Les colonnes subscription_plan_id et user_id sont déjà créées et peuplées
-- dans 20260114143519_prepare_data_for_subscription_migration.sql
-- On skip leur création ici

-- Créer les index seulement s'ils n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscription_plans_name_key') THEN
    CREATE UNIQUE INDEX subscription_plans_name_key ON public.subscription_plans USING btree (name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscription_plans_pkey') THEN
    CREATE UNIQUE INDEX subscription_plans_pkey ON public.subscription_plans USING btree (id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'subscriptions_pkey') THEN
    CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (user_id);
  END IF;
END $$;

-- Ajouter les contraintes seulement si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_plans_pkey'
  ) THEN
    ALTER TABLE "public"."subscription_plans" 
    ADD CONSTRAINT "subscription_plans_pkey" 
    PRIMARY KEY USING INDEX subscription_plans_pkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_pkey'
  ) THEN
    ALTER TABLE "public"."subscriptions" 
    ADD CONSTRAINT "subscriptions_pkey" 
    PRIMARY KEY USING INDEX subscriptions_pkey;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_plans_name_key'
  ) THEN
    ALTER TABLE "public"."subscription_plans" 
    ADD CONSTRAINT "subscription_plans_name_key" 
    UNIQUE USING INDEX subscription_plans_name_key;
  END IF;
END $$;

-- Ajouter les foreign keys seulement si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_subscription_plan_id_fkey'
  ) THEN
    ALTER TABLE "public"."subscriptions" 
    ADD CONSTRAINT "subscriptions_subscription_plan_id_fkey" 
    FOREIGN KEY (subscription_plan_id) 
    REFERENCES public.subscription_plans(id) 
    ON UPDATE RESTRICT ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."subscriptions" 
    ADD CONSTRAINT "subscriptions_user_id_fkey" 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;

-- Note: Cette contrainte était dans la migration originale mais semble incorrecte
-- subscriptions_establishment_id_key sur user_id ?
-- On la skip car on a déjà subscriptions_pkey sur user_id

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.count_distinct_members_for_owner_role(p_owner_id uuid)
 RETURNS bigint
 LANGUAGE sql
 STABLE
AS $function$
  SELECT COUNT(DISTINCT em_all.user_id)
  FROM establishment_members em_owner
  JOIN establishment_members em_all
    ON em_all.establishment_id = em_owner.establishment_id
  WHERE em_owner.user_id = p_owner_id
    AND em_owner.role = 'owner';
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
            WHEN ((i.status <> 'paid'::public.invoices_status) AND (i.due_date < now())) THEN true
            ELSE false
        END AS overdue,
    i.paid_at
   FROM (public.invoices i
     JOIN public.suppliers s ON ((i.supplier_id = s.id)));


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

CREATE OR REPLACE FUNCTION public.make_email_prefix(src text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$select regexp_replace(
  regexp_replace(
    lower(public.unaccent(coalesce(src, ''))),
    '[^a-z0-9]+', '-', 'g'                -- non-alphanum -> '-'
  ),
  '(^-|-$)', '', 'g'                      -- trim '-'
)$function$
;

CREATE OR REPLACE FUNCTION public.set_email_prefix_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
  base text;
  try text;
  i int := 1;
begin
  if new.email_prefix is not null then
    return new;
  end if;

  base := public.make_email_prefix(new.name);
  if base = '' then base := 'etablissement'; end if;
  try := base;

  while exists(select 1 from public.establishments where email_prefix = try) loop
    i := i + 1;
    try := base || '-' || i;
  end loop;

  new.email_prefix := try;
  return new;
end;$function$
;

grant delete on table "public"."subscription_plans" to "anon";

grant insert on table "public"."subscription_plans" to "anon";

grant references on table "public"."subscription_plans" to "anon";

grant select on table "public"."subscription_plans" to "anon";

grant trigger on table "public"."subscription_plans" to "anon";

grant truncate on table "public"."subscription_plans" to "anon";

grant update on table "public"."subscription_plans" to "anon";

grant delete on table "public"."subscription_plans" to "authenticated";

grant insert on table "public"."subscription_plans" to "authenticated";

grant references on table "public"."subscription_plans" to "authenticated";

grant select on table "public"."subscription_plans" to "authenticated";

grant trigger on table "public"."subscription_plans" to "authenticated";

grant truncate on table "public"."subscription_plans" to "authenticated";

grant update on table "public"."subscription_plans" to "authenticated";

grant delete on table "public"."subscription_plans" to "service_role";

grant insert on table "public"."subscription_plans" to "service_role";

grant references on table "public"."subscription_plans" to "service_role";

grant select on table "public"."subscription_plans" to "service_role";

grant trigger on table "public"."subscription_plans" to "service_role";

grant truncate on table "public"."subscription_plans" to "service_role";

grant update on table "public"."subscription_plans" to "service_role";


  create policy "Allow ALL to establishment members"
  on "public"."subscriptions"
  as permissive
  for all
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER trg_set_email_prefix BEFORE INSERT ON public.establishments FOR EACH ROW EXECUTE FUNCTION public.set_email_prefix_on_insert();

drop policy if exists "Allow DELETE own user" on "storage"."objects";

drop policy if exists "Allow INSERT own user" on "storage"."objects";

drop policy if exists "Allow SELECT own user" on "storage"."objects";

drop policy if exists "Allow UPDATE own user" on "storage"."objects";

drop policy if exists "Give users access to own folder aj13hi_0" on "storage"."objects";

drop policy if exists "Give users access to own folder aj13hi_1" on "storage"."objects";

drop policy if exists "Give users access to own folder aj13hi_2" on "storage"."objects";

drop policy if exists "Give users access to own folder aj13hi_3" on "storage"."objects";


  create policy "Allow CRUD own user aj13hi_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow CRUD own user aj13hi_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow CRUD own user aj13hi_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



  create policy "Allow CRUD own user aj13hi_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'invoices'::text) AND ((( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1]) OR public.is_auth_user_allowed_establishment(((storage.foldername(name))[1])::uuid))));



