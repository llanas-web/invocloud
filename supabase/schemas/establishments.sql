create table "public"."establishments" (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    name text not null,
    address text,
    phone text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint establishments_pkey primary key (id),
    constraint establishments_user_id_fkey foreign KEY (user_id) references public.users (id) on update CASCADE on delete CASCADE
);