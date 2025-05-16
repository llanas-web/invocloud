create table "public"."stakeholders" (
    id uuid not null default gen_random_uuid(),
    establishment_id uuid not null,
    name text not null,
    email text,
    phone text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint stakeholders_pkey primary key (id),
    constraint stakeholders_establishment_id_fkey foreign KEY (establishment_id) references public.establishments (id) on update CASCADE on delete CASCADE
)