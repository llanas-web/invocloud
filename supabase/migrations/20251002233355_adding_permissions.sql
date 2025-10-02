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

grant delete on table "public"."establishment_members" to "anon";

grant insert on table "public"."establishment_members" to "anon";

grant references on table "public"."establishment_members" to "anon";

grant select on table "public"."establishment_members" to "anon";

grant trigger on table "public"."establishment_members" to "anon";

grant truncate on table "public"."establishment_members" to "anon";

grant update on table "public"."establishment_members" to "anon";

grant delete on table "public"."establishment_members" to "authenticated";

grant insert on table "public"."establishment_members" to "authenticated";

grant references on table "public"."establishment_members" to "authenticated";

grant select on table "public"."establishment_members" to "authenticated";

grant trigger on table "public"."establishment_members" to "authenticated";

grant truncate on table "public"."establishment_members" to "authenticated";

grant update on table "public"."establishment_members" to "authenticated";

grant delete on table "public"."establishment_members" to "service_role";

grant insert on table "public"."establishment_members" to "service_role";

grant references on table "public"."establishment_members" to "service_role";

grant select on table "public"."establishment_members" to "service_role";

grant trigger on table "public"."establishment_members" to "service_role";

grant truncate on table "public"."establishment_members" to "service_role";

grant update on table "public"."establishment_members" to "service_role";

grant delete on table "public"."establishments" to "anon";

grant insert on table "public"."establishments" to "anon";

grant references on table "public"."establishments" to "anon";

grant select on table "public"."establishments" to "anon";

grant trigger on table "public"."establishments" to "anon";

grant truncate on table "public"."establishments" to "anon";

grant update on table "public"."establishments" to "anon";

grant delete on table "public"."establishments" to "authenticated";

grant insert on table "public"."establishments" to "authenticated";

grant references on table "public"."establishments" to "authenticated";

grant select on table "public"."establishments" to "authenticated";

grant trigger on table "public"."establishments" to "authenticated";

grant truncate on table "public"."establishments" to "authenticated";

grant update on table "public"."establishments" to "authenticated";

grant delete on table "public"."establishments" to "service_role";

grant insert on table "public"."establishments" to "service_role";

grant references on table "public"."establishments" to "service_role";

grant select on table "public"."establishments" to "service_role";

grant trigger on table "public"."establishments" to "service_role";

grant truncate on table "public"."establishments" to "service_role";

grant update on table "public"."establishments" to "service_role";

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

grant delete on table "public"."upload_validations" to "anon";

grant insert on table "public"."upload_validations" to "anon";

grant references on table "public"."upload_validations" to "anon";

grant select on table "public"."upload_validations" to "anon";

grant trigger on table "public"."upload_validations" to "anon";

grant truncate on table "public"."upload_validations" to "anon";

grant update on table "public"."upload_validations" to "anon";

grant delete on table "public"."upload_validations" to "authenticated";

grant insert on table "public"."upload_validations" to "authenticated";

grant references on table "public"."upload_validations" to "authenticated";

grant select on table "public"."upload_validations" to "authenticated";

grant trigger on table "public"."upload_validations" to "authenticated";

grant truncate on table "public"."upload_validations" to "authenticated";

grant update on table "public"."upload_validations" to "authenticated";

grant delete on table "public"."upload_validations" to "service_role";

grant insert on table "public"."upload_validations" to "service_role";

grant references on table "public"."upload_validations" to "service_role";

grant select on table "public"."upload_validations" to "service_role";

grant trigger on table "public"."upload_validations" to "service_role";

grant truncate on table "public"."upload_validations" to "service_role";

grant update on table "public"."upload_validations" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


