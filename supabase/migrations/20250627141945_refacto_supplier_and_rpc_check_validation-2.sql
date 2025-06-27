drop function if exists "public"."check_sender_authorized"(recipient_email text, sender_email text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_sender_authorized(recipient_email text, sender_email text)
 RETURNS TABLE(establishment_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
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
end;
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


