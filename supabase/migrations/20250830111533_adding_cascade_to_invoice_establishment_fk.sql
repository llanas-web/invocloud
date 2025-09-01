alter table "public"."invoices" drop constraint "invoices_supplier_id_fkey";

alter table "public"."invoices" add constraint "invoices_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_supplier_id_fkey";


