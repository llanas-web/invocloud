create type "public"."invoices_status" as enum ('pending', 'sent', 'paid');

create table "public"."establishments" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "address" text,
    "phone" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."invoces" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "establishment_id" uuid not null,
    "invoice_number" text,
    "amount" numeric(10,2) not null,
    "status" invoices_status not null default 'pending'::invoices_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."stakeholders" (
    "id" uuid not null default gen_random_uuid(),
    "establishment_id" uuid not null,
    "name" text not null,
    "email" text,
    "phone" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "full_name" text
);


CREATE UNIQUE INDEX establishments_pkey ON public.establishments USING btree (id);

CREATE UNIQUE INDEX invoices_pkey ON public.invoces USING btree (id);

CREATE UNIQUE INDEX stakeholders_pkey ON public.stakeholders USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."establishments" add constraint "establishments_pkey" PRIMARY KEY using index "establishments_pkey";

alter table "public"."invoces" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."stakeholders" add constraint "stakeholders_pkey" PRIMARY KEY using index "stakeholders_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."establishments" add constraint "establishments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."establishments" validate constraint "establishments_user_id_fkey";

alter table "public"."invoces" add constraint "invoices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoces" validate constraint "invoices_user_id_fkey";

alter table "public"."stakeholders" add constraint "stakeholders_establishment_id_fkey" FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."stakeholders" validate constraint "stakeholders_establishment_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE 
  is_admin boolean;

BEGIN
  insert into public.users (id, email, full_name)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  return new;
end;$function$
;

CREATE TRIGGER "on_new_user"
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE "public"."handle_new_user"();

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

grant delete on table "public"."invoces" to "anon";

grant insert on table "public"."invoces" to "anon";

grant references on table "public"."invoces" to "anon";

grant select on table "public"."invoces" to "anon";

grant trigger on table "public"."invoces" to "anon";

grant truncate on table "public"."invoces" to "anon";

grant update on table "public"."invoces" to "anon";

grant delete on table "public"."invoces" to "authenticated";

grant insert on table "public"."invoces" to "authenticated";

grant references on table "public"."invoces" to "authenticated";

grant select on table "public"."invoces" to "authenticated";

grant trigger on table "public"."invoces" to "authenticated";

grant truncate on table "public"."invoces" to "authenticated";

grant update on table "public"."invoces" to "authenticated";

grant delete on table "public"."invoces" to "service_role";

grant insert on table "public"."invoces" to "service_role";

grant references on table "public"."invoces" to "service_role";

grant select on table "public"."invoces" to "service_role";

grant trigger on table "public"."invoces" to "service_role";

grant truncate on table "public"."invoces" to "service_role";

grant update on table "public"."invoces" to "service_role";

grant delete on table "public"."stakeholders" to "anon";

grant insert on table "public"."stakeholders" to "anon";

grant references on table "public"."stakeholders" to "anon";

grant select on table "public"."stakeholders" to "anon";

grant trigger on table "public"."stakeholders" to "anon";

grant truncate on table "public"."stakeholders" to "anon";

grant update on table "public"."stakeholders" to "anon";

grant delete on table "public"."stakeholders" to "authenticated";

grant insert on table "public"."stakeholders" to "authenticated";

grant references on table "public"."stakeholders" to "authenticated";

grant select on table "public"."stakeholders" to "authenticated";

grant trigger on table "public"."stakeholders" to "authenticated";

grant truncate on table "public"."stakeholders" to "authenticated";

grant update on table "public"."stakeholders" to "authenticated";

grant delete on table "public"."stakeholders" to "service_role";

grant insert on table "public"."stakeholders" to "service_role";

grant references on table "public"."stakeholders" to "service_role";

grant select on table "public"."stakeholders" to "service_role";

grant trigger on table "public"."stakeholders" to "service_role";

grant truncate on table "public"."stakeholders" to "service_role";

grant update on table "public"."stakeholders" to "service_role";

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


