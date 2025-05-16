create table "users" (
    id uuid not null default gen_random_uuid(),
    email text not null unique,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    full_name text,
    constraint users_pkey primary key (id),
    constraint users_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE on delete CASCADE
);


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE 
  is_admin boolean;

BEGIN
  insert into public.users (id, email, full_name)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  return new;
end;$$;

CREATE TRIGGER "on_new_user"
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE "public"."handle_new_user"();