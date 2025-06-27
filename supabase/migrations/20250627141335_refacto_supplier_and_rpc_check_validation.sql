create type "public"."establishment_member_role" as enum ('creator', 'admin');

revoke delete on table "public"."supplier_members" from "anon";

revoke insert on table "public"."supplier_members" from "anon";

revoke references on table "public"."supplier_members" from "anon";

revoke select on table "public"."supplier_members" from "anon";

revoke trigger on table "public"."supplier_members" from "anon";

revoke truncate on table "public"."supplier_members" from "anon";

revoke update on table "public"."supplier_members" from "anon";

revoke delete on table "public"."supplier_members" from "authenticated";

revoke insert on table "public"."supplier_members" from "authenticated";

revoke references on table "public"."supplier_members" from "authenticated";

revoke select on table "public"."supplier_members" from "authenticated";

revoke trigger on table "public"."supplier_members" from "authenticated";

revoke truncate on table "public"."supplier_members" from "authenticated";

revoke update on table "public"."supplier_members" from "authenticated";

revoke delete on table "public"."supplier_members" from "service_role";

revoke insert on table "public"."supplier_members" from "service_role";

revoke references on table "public"."supplier_members" from "service_role";

revoke select on table "public"."supplier_members" from "service_role";

revoke trigger on table "public"."supplier_members" from "service_role";

revoke truncate on table "public"."supplier_members" from "service_role";

revoke update on table "public"."supplier_members" from "service_role";

alter table "public"."supplier_members" drop constraint "supplier_members_supplier_id_fkey";

alter table "public"."suppliers" drop constraint "suppliers_establishment_id_fkey";

alter table "public"."supplier_members" drop constraint "supplier_members_pkey";

drop index if exists "public"."supplier_members_pkey";

drop table "public"."supplier_members";

alter table "public"."establishment_members" add column "role" establishment_member_role not null default 'admin'::establishment_member_role;

alter table "public"."suppliers" add column "emails" text[] not null default '{}'::text[];

alter table "public"."suppliers" add constraint "suppliers_establishment_id_fkey" FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."suppliers" validate constraint "suppliers_establishment_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_sender_authorized(recipient_email text, sender_email text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  select establishments.id as establishment_id
  from public.suppliers
  join public.establishments
    on establishments.id = suppliers.establishment_id
  join public.establishment_members
    on establishment_members.establishment_id = establishments.id
  join public.users
    on establishment_members.user_id = users.id
  where users.email = recipient_email
  and sender_email = any(suppliers.emails);
end;$function$
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

CREATE TRIGGER on_new_establishment AFTER INSERT ON public.establishments FOR EACH ROW EXECUTE FUNCTION handle_new_establishment();


