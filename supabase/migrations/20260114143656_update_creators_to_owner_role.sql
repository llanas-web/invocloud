-- ============================================================================
-- MIGRATION DE DONNÉES : Mise à jour des rôles des créateurs
-- ============================================================================
-- Cette migration s'exécute APRÈS 20260114143520_staging_to_prod.sql
-- Elle met à jour les rôles des créateurs d'établissement pour leur donner le rôle "owner"
-- ============================================================================

-- 1. Mettre à jour les establishment_members pour que les créateurs aient le rôle 'owner'
UPDATE "public"."establishment_members" em
SET role = 'owner'::public.establishment_member_role
FROM "public"."establishments" e
WHERE em.establishment_id = e.id
  AND em.user_id = e.creator_id
  AND em.role != 'owner';  -- Ne mettre à jour que si ce n'est pas déjà owner

-- 2. Afficher le résultat
DO $$ 
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO updated_count
  FROM "public"."establishment_members" em
  JOIN "public"."establishments" e ON em.establishment_id = e.id
  WHERE em.user_id = e.creator_id AND em.role = 'owner';

  RAISE NOTICE 'Nombre de créateurs avec le rôle owner : %', updated_count;
END $$;
