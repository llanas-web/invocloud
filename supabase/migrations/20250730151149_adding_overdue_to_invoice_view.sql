alter table "public"."invoices" add column "due_date" timestamp with time zone;

set check_function_bodies = off;

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
    s.establishment_id,
    i.due_date,
        CASE
            WHEN ((i.status <> 'paid'::invoices_status) AND (i.due_date < now())) THEN true
            ELSE false
        END AS overdue
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
      file_path,
      name
    ) VALUES (
      NEW.id, 
      selected_supplier_id,
      NEW.comment,
      NEW.file_path,
      COALESCE(NEW.name, NEW.file_name)
    );

  END IF;

  NEW.status = 'done';
  RETURN NEW;
END;$function$
;


