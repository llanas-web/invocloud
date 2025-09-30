-- === Hotfix: block deletions when subscription active ===

-- 1) Helper
create or replace function public.establishment_has_active_subscription(establishment_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(e.subscription_status in ('trialing','active','past_due','unpaid'), false)
  from public.establishments e
  where e.id = establishment_id
$$;

-- 2) Guard: establishments
create or replace function public.prevent_delete_establishment_if_active()
returns trigger
language plpgsql
as $$
begin
  if public.establishment_has_active_subscription(old.id) then
    raise exception 'Impossible de supprimer cet établissement: un abonnement Stripe est encore actif. Annulez l’abonnement puis réessayez.';
  end if;
  return old;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_prevent_delete_establishment_if_active'
  ) then
    create trigger trg_prevent_delete_establishment_if_active
      before delete on public.establishments
      for each row execute function public.prevent_delete_establishment_if_active();
  end if;
end$$;

-- 3) Helper: users
create or replace function public.user_has_active_billing_establishments(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.establishments e
    where e.creator_id = user_id
      and public.establishment_has_active_subscription(e.id)
  )
$$;

-- 4) Guard: users
create or replace function public.prevent_delete_user_if_active_sub()
returns trigger
language plpgsql
as $$
begin
  if public.user_has_active_billing_establishments(old.id) then
    raise exception 'Impossible de supprimer votre compte: au moins un de vos établissements a un abonnement Stripe actif. Annulez d’abord l’abonnement via la page Abonnement, puis réessayez.';
  end if;
  return old;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_prevent_delete_user_if_active_sub'
  ) then
    create trigger trg_prevent_delete_user_if_active_sub
      before delete on public.users
      for each row execute function public.prevent_delete_user_if_active_sub();
  end if;
end$$;
