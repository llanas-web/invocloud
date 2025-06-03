create type "public"."upload_validations_status" as enum ('pending', 'uploaded', 'done');

alter table "public"."establishments" drop constraint "establishments_user_id_fkey";

alter table "public"."invoices" drop constraint "invoices_user_id_fkey";

alter table "public"."suppliers" drop constraint "stakeholders_user_id_fkey";

drop function if exists "public"."on_validate_pending_invoice"();

create table "public"."supplier_members" (
    "created_at" timestamp with time zone not null default now(),
    "supplier_id" uuid not null,
    "name" text,
    "email" text not null,
    "id" uuid not null default gen_random_uuid()
);


create table "public"."upload_validations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "uploader_id" uuid not null,
    "token_hash" text not null,
    "token_expires_at" timestamp with time zone not null,
    "status" upload_validations_status not null default 'pending'::upload_validations_status,
    "comment" text,
    "supplier_id" uuid not null,
    "file_path" text not null
);


alter table "public"."establishments" drop column "user_id";

alter table "public"."establishments" add column "creator_id" uuid not null;

alter table "public"."invoices" drop column "user_id";

alter table "public"."suppliers" drop column "email";

alter table "public"."suppliers" drop column "user_id";

alter table "public"."suppliers" add column "establishment_id" uuid not null;

CREATE UNIQUE INDEX supplier_members_pkey ON public.supplier_members USING btree (id);

CREATE UNIQUE INDEX upload_validation_pkey ON public.upload_validations USING btree (id);

alter table "public"."supplier_members" add constraint "supplier_members_pkey" PRIMARY KEY using index "supplier_members_pkey";

alter table "public"."upload_validations" add constraint "upload_validation_pkey" PRIMARY KEY using index "upload_validation_pkey";

alter table "public"."establishments" add constraint "establishments_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."establishments" validate constraint "establishments_creator_id_fkey";

alter table "public"."supplier_members" add constraint "supplier_members_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES suppliers(id) not valid;

alter table "public"."supplier_members" validate constraint "supplier_members_supplier_id_fkey";

alter table "public"."suppliers" add constraint "suppliers_establishment_id_fkey" FOREIGN KEY (establishment_id) REFERENCES establishments(id) not valid;

alter table "public"."suppliers" validate constraint "suppliers_establishment_id_fkey";

alter table "public"."upload_validations" add constraint "upload_validations_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES suppliers(id) not valid;

alter table "public"."upload_validations" validate constraint "upload_validations_supplier_id_fkey";

alter table "public"."upload_validations" add constraint "upload_validations_uploader_id_fkey" FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."upload_validations" validate constraint "upload_validations_uploader_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.on_upload_file()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  IF (new.status = 'uploaded') THEN
    insert into public.invoices (
      id,
      supplier_id,
      comment,
      file_path
    ) values (
      new.id, 
      new.supplier_id,
      new.comment,
      new.file_path
    );
  END IF;
  new.status = 'done';
  return new;
END;$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE 
  is_admin boolean;

BEGIN
  IF(new.is_anonymous = false) THEN
    insert into public.users (id, email, full_name)
    values (
      new.id, 
      new.email,
      new.raw_user_meta_data->>'full_name'
    );
    insert into public.establishment (creator_id, name)
    values (
      new.id,
      new.raw_user_meta_data->>'full_name'
    );
  END IF;

  return new;
end;$function$
;

grant delete on table "public"."supplier_members" to "anon";

grant insert on table "public"."supplier_members" to "anon";

grant references on table "public"."supplier_members" to "anon";

grant select on table "public"."supplier_members" to "anon";

grant trigger on table "public"."supplier_members" to "anon";

grant truncate on table "public"."supplier_members" to "anon";

grant update on table "public"."supplier_members" to "anon";

grant delete on table "public"."supplier_members" to "authenticated";

grant insert on table "public"."supplier_members" to "authenticated";

grant references on table "public"."supplier_members" to "authenticated";

grant select on table "public"."supplier_members" to "authenticated";

grant trigger on table "public"."supplier_members" to "authenticated";

grant truncate on table "public"."supplier_members" to "authenticated";

grant update on table "public"."supplier_members" to "authenticated";

grant delete on table "public"."supplier_members" to "service_role";

grant insert on table "public"."supplier_members" to "service_role";

grant references on table "public"."supplier_members" to "service_role";

grant select on table "public"."supplier_members" to "service_role";

grant trigger on table "public"."supplier_members" to "service_role";

grant truncate on table "public"."supplier_members" to "service_role";

grant update on table "public"."supplier_members" to "service_role";

grant delete on table "public"."upload_validations" to "anon";

grant insert on table "public"."upload_validations" to "anon";

grant references on table "public"."upload_validations" to "anon";

grant select on table "public"."upload_validations" to "anon";

grant trigger on table "public"."upload_validations" to "anon";

grant truncate on table "public"."upload_validations" to "anon";

grant update on table "public"."upload_validations" to "anon";

grant delete on table "public"."upload_validations" to "authenticated";

grant insert on table "public"."upload_validations" to "authenticated";

grant references on table "public"."upload_validations" to "authenticated";

grant select on table "public"."upload_validations" to "authenticated";

grant trigger on table "public"."upload_validations" to "authenticated";

grant truncate on table "public"."upload_validations" to "authenticated";

grant update on table "public"."upload_validations" to "authenticated";

grant delete on table "public"."upload_validations" to "service_role";

grant insert on table "public"."upload_validations" to "service_role";

grant references on table "public"."upload_validations" to "service_role";

grant select on table "public"."upload_validations" to "service_role";

grant trigger on table "public"."upload_validations" to "service_role";

grant truncate on table "public"."upload_validations" to "service_role";

grant update on table "public"."upload_validations" to "service_role";

CREATE TRIGGER on_upload_validation_done AFTER UPDATE ON public.upload_validations FOR EACH ROW EXECUTE FUNCTION on_upload_file();


