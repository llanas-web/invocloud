revoke delete on table "public"."invoces" from "anon";

revoke insert on table "public"."invoces" from "anon";

revoke references on table "public"."invoces" from "anon";

revoke select on table "public"."invoces" from "anon";

revoke trigger on table "public"."invoces" from "anon";

revoke truncate on table "public"."invoces" from "anon";

revoke update on table "public"."invoces" from "anon";

revoke delete on table "public"."invoces" from "authenticated";

revoke insert on table "public"."invoces" from "authenticated";

revoke references on table "public"."invoces" from "authenticated";

revoke select on table "public"."invoces" from "authenticated";

revoke trigger on table "public"."invoces" from "authenticated";

revoke truncate on table "public"."invoces" from "authenticated";

revoke update on table "public"."invoces" from "authenticated";

revoke delete on table "public"."invoces" from "service_role";

revoke insert on table "public"."invoces" from "service_role";

revoke references on table "public"."invoces" from "service_role";

revoke select on table "public"."invoces" from "service_role";

revoke trigger on table "public"."invoces" from "service_role";

revoke truncate on table "public"."invoces" from "service_role";

revoke update on table "public"."invoces" from "service_role";

alter table "public"."invoces" drop constraint "invoices_user_id_fkey";

alter table "public"."invoces" drop constraint "invoices_pkey";

drop index if exists "public"."invoices_pkey";

drop table "public"."invoces";

create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "establishment_id" uuid not null,
    "invoice_number" text,
    "amount" numeric(10,2) not null,
    "status" invoices_status not null default 'pending'::invoices_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."invoices" add constraint "invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_user_id_fkey";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";


