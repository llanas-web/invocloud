alter table "public"."upload_validations" add column "file_name" text not null default ''''''::text;

set check_function_bodies = off;

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
      file_path,
      name
    ) VALUES (
      NEW.id, 
      selected_supplier_id,
      NEW.comment,
      NEW.file_path,
      NEW.file_name
    );

  END IF;

  NEW.status = 'done';
  RETURN NEW;
END;$function$
;


