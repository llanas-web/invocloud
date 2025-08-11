alter table "public"."invoices" add column "paid_at" timestamp with time zone;

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
        END AS overdue,
    i.paid_at
   FROM (invoices i
     JOIN suppliers s ON ((i.supplier_id = s.id)));



