alter table "public"."upload_validations" drop constraint "upload_validations_supplier_id_fkey";

drop function if exists "public"."check_sender_authorized"(recipient_email text, sender_email text);

alter table "public"."upload_validations" drop column "supplier_id";

alter table "public"."upload_validations" add column "establishments" uuid[] not null;

alter table "public"."upload_validations" add column "recipient_email" text;

alter table "public"."upload_validations" add column "suppliers" uuid[] not null default '{}'::uuid[];

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


