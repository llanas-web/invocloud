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


