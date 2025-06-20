create type "public"."establishment_member_status" as enum ('pending', 'accepted', 'declined');

create table "public"."establishment_members" (
    "created_at" timestamp with time zone not null default now(),
    "establishment_id" uuid not null,
    "user_id" uuid not null,
    "status" establishment_member_status not null default 'pending'::establishment_member_status
);


CREATE UNIQUE INDEX establishment_member_pkey ON public.establishment_members USING btree (establishment_id, user_id);

alter table "public"."establishment_members" add constraint "establishment_member_pkey" PRIMARY KEY using index "establishment_member_pkey";

alter table "public"."establishment_members" add constraint "establishment_member_establishment_id_fkey" FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."establishment_members" validate constraint "establishment_member_establishment_id_fkey";

alter table "public"."establishment_members" add constraint "establishment_member_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."establishment_members" validate constraint "establishment_member_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  new_establishment_id uuid;
BEGIN
  IF (NEW.is_anonymous = false) THEN
    -- Insert into users table
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name'
    );

    -- Handle invitation-based join
    IF (NEW.raw_user_meta_data->>'establishment_id') IS NOT NULL THEN
      new_establishment_id := (NEW.raw_user_meta_data->>'establishment_id')::uuid;

      INSERT INTO public.establishment_members (establishment_id, user_id)
      VALUES (
        new_establishment_id,
        NEW.id
      );

    -- Handle creation of a new establishment
    ELSIF (NEW.raw_user_meta_data->>'establishment_name') IS NOT NULL THEN
      INSERT INTO public.establishments (name, creator_id)
      VALUES (
        NEW.raw_user_meta_data->>'establishment_name',
        NEW.id
      )
      RETURNING id INTO new_establishment_id;
    END IF;

    -- Insert user settings with favorite establishment
    INSERT INTO public.user_settings (user_id, favorite_establishment_id)
    VALUES (
      NEW.id,
      new_establishment_id
    );
  END IF;

  RETURN NEW;
END;$function$
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


