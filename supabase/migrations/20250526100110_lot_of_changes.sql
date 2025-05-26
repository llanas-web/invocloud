create type "public"."pending_invoices_status" as enum ('pending', 'confirmed', 'uploaded', 'validated', 'rejected', 'error');

alter table "public"."stakeholders" drop constraint "stakeholders_establishment_id_fkey";

create table "public"."pending_invoices" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "stakeholder_id" uuid not null,
    "status" pending_invoices_status not null default 'pending'::pending_invoices_status,
    "token" text,
    "token_expires_at" timestamp with time zone,
    "comment" text
);


alter table "public"."invoices" drop column "establishment_id";

alter table "public"."invoices" add column "comment" text;

alter table "public"."invoices" add column "name" text;

alter table "public"."invoices" add column "stakeholder_id" uuid not null;

alter table "public"."invoices" alter column "amount" drop not null;

alter table "public"."stakeholders" drop column "establishment_id";

alter table "public"."stakeholders" add column "user_id" uuid;

CREATE UNIQUE INDEX pending_invoices_pkey ON public.pending_invoices USING btree (id);

alter table "public"."pending_invoices" add constraint "pending_invoices_pkey" PRIMARY KEY using index "pending_invoices_pkey";

alter table "public"."invoices" add constraint "invoices_stakeholder_id_fkey" FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(id) not valid;

alter table "public"."invoices" validate constraint "invoices_stakeholder_id_fkey";

alter table "public"."pending_invoices" add constraint "pending_invoices_stakeholder_id_fkey" FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(id) not valid;

alter table "public"."pending_invoices" validate constraint "pending_invoices_stakeholder_id_fkey";

alter table "public"."pending_invoices" add constraint "pending_invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."pending_invoices" validate constraint "pending_invoices_user_id_fkey";

alter table "public"."stakeholders" add constraint "stakeholders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."stakeholders" validate constraint "stakeholders_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.on_validate_pending_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  IF (new.status = 'validated') THEN
    insert into public.invoices (id, stakeholder_id, user_id, comment)
    values (
      new.id, 
      new.stakeholder_id,
      new.user_id,
      new.comment
    );
  END IF;
  return new;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE 
  is_admin boolean;

BEGIN
  IF(new.is_anonymous = false) THEN
    insert into public.users (id, email, full_name)
    values (
      new.id, 
      new.email,
      new.raw_user_meta_data->>'full_name'
    );
  END IF;

  return new;
end;$function$
;

grant delete on table "public"."pending_invoices" to "anon";

grant insert on table "public"."pending_invoices" to "anon";

grant references on table "public"."pending_invoices" to "anon";

grant select on table "public"."pending_invoices" to "anon";

grant trigger on table "public"."pending_invoices" to "anon";

grant truncate on table "public"."pending_invoices" to "anon";

grant update on table "public"."pending_invoices" to "anon";

grant delete on table "public"."pending_invoices" to "authenticated";

grant insert on table "public"."pending_invoices" to "authenticated";

grant references on table "public"."pending_invoices" to "authenticated";

grant select on table "public"."pending_invoices" to "authenticated";

grant trigger on table "public"."pending_invoices" to "authenticated";

grant truncate on table "public"."pending_invoices" to "authenticated";

grant update on table "public"."pending_invoices" to "authenticated";

grant delete on table "public"."pending_invoices" to "service_role";

grant insert on table "public"."pending_invoices" to "service_role";

grant references on table "public"."pending_invoices" to "service_role";

grant select on table "public"."pending_invoices" to "service_role";

grant trigger on table "public"."pending_invoices" to "service_role";

grant truncate on table "public"."pending_invoices" to "service_role";

grant update on table "public"."pending_invoices" to "service_role";

CREATE TRIGGER on_pending_invoice_update BEFORE UPDATE ON public.pending_invoices FOR EACH ROW EXECUTE FUNCTION on_validate_pending_invoice();


