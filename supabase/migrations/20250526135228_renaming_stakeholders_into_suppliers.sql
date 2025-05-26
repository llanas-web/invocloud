drop trigger if exists "on_pending_invoice_update" on "public"."pending_invoices";

revoke delete on table "public"."pending_invoices" from "anon";

revoke insert on table "public"."pending_invoices" from "anon";

revoke references on table "public"."pending_invoices" from "anon";

revoke select on table "public"."pending_invoices" from "anon";

revoke trigger on table "public"."pending_invoices" from "anon";

revoke truncate on table "public"."pending_invoices" from "anon";

revoke update on table "public"."pending_invoices" from "anon";

revoke delete on table "public"."pending_invoices" from "authenticated";

revoke insert on table "public"."pending_invoices" from "authenticated";

revoke references on table "public"."pending_invoices" from "authenticated";

revoke select on table "public"."pending_invoices" from "authenticated";

revoke trigger on table "public"."pending_invoices" from "authenticated";

revoke truncate on table "public"."pending_invoices" from "authenticated";

revoke update on table "public"."pending_invoices" from "authenticated";

revoke delete on table "public"."pending_invoices" from "service_role";

revoke insert on table "public"."pending_invoices" from "service_role";

revoke references on table "public"."pending_invoices" from "service_role";

revoke select on table "public"."pending_invoices" from "service_role";

revoke trigger on table "public"."pending_invoices" from "service_role";

revoke truncate on table "public"."pending_invoices" from "service_role";

revoke update on table "public"."pending_invoices" from "service_role";

revoke delete on table "public"."stakeholders" from "anon";

revoke insert on table "public"."stakeholders" from "anon";

revoke references on table "public"."stakeholders" from "anon";

revoke select on table "public"."stakeholders" from "anon";

revoke trigger on table "public"."stakeholders" from "anon";

revoke truncate on table "public"."stakeholders" from "anon";

revoke update on table "public"."stakeholders" from "anon";

revoke delete on table "public"."stakeholders" from "authenticated";

revoke insert on table "public"."stakeholders" from "authenticated";

revoke references on table "public"."stakeholders" from "authenticated";

revoke select on table "public"."stakeholders" from "authenticated";

revoke trigger on table "public"."stakeholders" from "authenticated";

revoke truncate on table "public"."stakeholders" from "authenticated";

revoke update on table "public"."stakeholders" from "authenticated";

revoke delete on table "public"."stakeholders" from "service_role";

revoke insert on table "public"."stakeholders" from "service_role";

revoke references on table "public"."stakeholders" from "service_role";

revoke select on table "public"."stakeholders" from "service_role";

revoke trigger on table "public"."stakeholders" from "service_role";

revoke truncate on table "public"."stakeholders" from "service_role";

revoke update on table "public"."stakeholders" from "service_role";

alter table "public"."invoices" drop constraint "invoices_stakeholder_id_fkey";

alter table "public"."pending_invoices" drop constraint "pending_invoices_stakeholder_id_fkey";

alter table "public"."pending_invoices" drop constraint "pending_invoices_user_id_fkey";

alter table "public"."stakeholders" drop constraint "stakeholders_user_id_fkey";

alter table "public"."pending_invoices" drop constraint "pending_invoices_pkey";

alter table "public"."stakeholders" drop constraint "stakeholders_pkey";

drop index if exists "public"."pending_invoices_pkey";

drop index if exists "public"."stakeholders_pkey";

drop table "public"."pending_invoices";

drop table "public"."stakeholders";

alter table "public"."invoices" alter column "status" drop default;

alter type "public"."invoices_status" rename to "invoices_status__old_version_to_be_dropped";

create type "public"."invoices_status" as enum ('pending', 'sent', 'validated', 'paid', 'error');

create table "public"."suppliers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "email" text not null,
    "phone" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."invoices" alter column status type "public"."invoices_status" using status::text::"public"."invoices_status";

alter table "public"."invoices" alter column "status" set default 'pending'::invoices_status;

drop type "public"."invoices_status__old_version_to_be_dropped";

alter table "public"."invoices" drop column "stakeholder_id";

alter table "public"."invoices" add column "supplier_id" uuid not null;

drop type "public"."pending_invoices_status";

CREATE UNIQUE INDEX stakeholders_pkey ON public.suppliers USING btree (id);

alter table "public"."suppliers" add constraint "stakeholders_pkey" PRIMARY KEY using index "stakeholders_pkey";

alter table "public"."invoices" add constraint "invoices_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES suppliers(id) not valid;

alter table "public"."invoices" validate constraint "invoices_supplier_id_fkey";

alter table "public"."suppliers" add constraint "stakeholders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."suppliers" validate constraint "stakeholders_user_id_fkey";

grant delete on table "public"."suppliers" to "anon";

grant insert on table "public"."suppliers" to "anon";

grant references on table "public"."suppliers" to "anon";

grant select on table "public"."suppliers" to "anon";

grant trigger on table "public"."suppliers" to "anon";

grant truncate on table "public"."suppliers" to "anon";

grant update on table "public"."suppliers" to "anon";

grant delete on table "public"."suppliers" to "authenticated";

grant insert on table "public"."suppliers" to "authenticated";

grant references on table "public"."suppliers" to "authenticated";

grant select on table "public"."suppliers" to "authenticated";

grant trigger on table "public"."suppliers" to "authenticated";

grant truncate on table "public"."suppliers" to "authenticated";

grant update on table "public"."suppliers" to "authenticated";

grant delete on table "public"."suppliers" to "service_role";

grant insert on table "public"."suppliers" to "service_role";

grant references on table "public"."suppliers" to "service_role";

grant select on table "public"."suppliers" to "service_role";

grant trigger on table "public"."suppliers" to "service_role";

grant truncate on table "public"."suppliers" to "service_role";

grant update on table "public"."suppliers" to "service_role";


