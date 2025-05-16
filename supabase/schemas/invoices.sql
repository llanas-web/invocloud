CREATE TYPE "public"."invoices_status" AS ENUM (
    'pending',
    'sent',
    'paid'
);

create table "public"."invoces" (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    establishment_id uuid not null,
    invoice_number text,
    amount numeric(10, 2) not null,
    status public.invoices_status not null default 'pending'::invoices_status,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint invoices_pkey primary key (id),
    constraint invoices_user_id_fkey foreign KEY (user_id) references public.users (id) on update CASCADE on delete CASCADE
);