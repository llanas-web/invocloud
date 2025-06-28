drop view if exists "public"."invoices_with_establishment";

alter table "public"."establishments" add column "stripe_customer_id" text;

alter table "public"."establishments" add column "stripe_subscription_id" text;

alter table "public"."establishments" add column "subscription_end" timestamp with time zone;

alter table "public"."establishments" add column "subscription_start" timestamp with time zone;

alter table "public"."establishments" add column "subscription_status" text;

alter table "public"."establishments" add column "trial_end" timestamp with time zone;

alter table "public"."invoices" add column "taxe_amount" numeric default '0'::numeric;

alter table "public"."invoices" alter column "file_path" set not null;

alter table "public"."upload_validations" add column "selected_establishment" uuid;

alter table "public"."upload_validations" alter column "file_path" drop not null;

alter table "public"."upload_validations" add constraint "upload_validations_selected_establishment_fkey" FOREIGN KEY (selected_establishment) REFERENCES establishments(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."upload_validations" validate constraint "upload_validations_selected_establishment_fkey";

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
      );
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

create or replace view "public"."invoices_with_establishment" as  SELECT i.id,
    i.supplier_id,
    i.invoice_number,
    i.amount,
    i.status,
    i.created_at,
    i.updated_at,
    i.name,
    i.comment,
    i.file_path,
    i.taxe_amount,
    s.name AS supplier_name,
    s.establishment_id
   FROM (invoices i
     JOIN suppliers s ON ((i.supplier_id = s.id)));


CREATE OR REPLACE FUNCTION public.on_upload_file()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  selected_supplier_id uuid;
BEGIN
  IF (NEW.status = 'uploaded') THEN

    SELECT id
    INTO selected_supplier_id
    FROM public.suppliers
    WHERE suppliers.establishment_id = NEW.selected_establishment
      AND suppliers.id = ANY(NEW.suppliers); -- assuming NEW.suppliers is uuid[]

    INSERT INTO public.invoices (
      id,
      supplier_id,
      comment,
      file_path
    ) VALUES (
      NEW.id, 
      selected_supplier_id,
      NEW.comment,
      NEW.file_path
    );

  END IF;

  NEW.status = 'done';
  RETURN NEW;
END;$function$
;


