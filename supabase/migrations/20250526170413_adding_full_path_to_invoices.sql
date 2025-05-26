alter table "public"."invoices" add column "file_path" text;

alter table "public"."invoices" alter column "status" set default 'validated'::invoices_status;


