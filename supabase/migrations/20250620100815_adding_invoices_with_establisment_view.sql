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
    s.name AS supplier_name,
    s.establishment_id
   FROM (invoices i
     JOIN suppliers s ON ((i.supplier_id = s.id)));



