alter table "public"."establishment_members" enable row level security;

alter table "public"."establishments" enable row level security;

alter table "public"."invoices" enable row level security;

alter table "public"."suppliers" enable row level security;

alter table "public"."upload_validations" enable row level security;

alter table "public"."user_settings" enable row level security;

alter table "public"."users" enable row level security;

set check_function_bodies = off;

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

create policy "Allow ALL to own user"
on "public"."establishment_members"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Allow SELECT to same establishment members"
on "public"."establishment_members"
as permissive
for select
to authenticated
using (is_user_same_establishment(auth.uid(), user_id, true));


create policy "Allow ALL to creator"
on "public"."establishments"
as permissive
for all
to authenticated
using ((auth.uid() = creator_id))
with check ((auth.uid() = creator_id));


create policy "Allow SELECT to establishement member"
on "public"."establishments"
as permissive
for select
to authenticated
using (is_auth_member_of_establishment(id, true));


create policy "Allow ALL to member of establishement of the supplier"
on "public"."invoices"
as permissive
for all
to authenticated
using (is_auth_member_of_supplier(supplier_id, true))
with check (is_auth_member_of_supplier(supplier_id, true));


create policy "Allow ALL to establisment members"
on "public"."suppliers"
as permissive
for all
to authenticated
using (is_auth_member_of_establishment(establishment_id, true))
with check (is_auth_member_of_establishment(establishment_id, true));


create policy "Allow ALL to own user"
on "public"."upload_validations"
as permissive
for all
to public
using ((auth.uid() = uploader_id))
with check ((auth.uid() = uploader_id));


create policy "Allow ALL to own user"
on "public"."user_settings"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Allow ALL to own user"
on "public"."users"
as permissive
for all
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Allow SELECT to same establishment member"
on "public"."users"
as permissive
for select
to authenticated
using (is_user_same_establishment(auth.uid(), id, true));



