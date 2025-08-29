drop view if exists "public"."invoices_with_establishment";

alter table "public"."invoices" drop column "taxe_amount";

alter table "public"."invoices" alter column "amount" set not null;

alter table "public"."invoices" alter column "due_date" set not null;

alter table "public"."invoices" alter column "invoice_number" set not null;

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
    s.establishment_id,
    i.due_date,
        CASE
            WHEN ((i.status <> 'paid'::invoices_status) AND (i.due_date < now())) THEN true
            ELSE false
        END AS overdue,
    i.paid_at
   FROM (invoices i
     JOIN suppliers s ON ((i.supplier_id = s.id)));



