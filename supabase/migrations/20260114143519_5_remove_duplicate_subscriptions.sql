-- ============================================================================
-- FIX : Supprimer les subscriptions en doublon
-- ============================================================================
-- Si un user_id a plusieurs subscriptions, garder uniquement la plus récente
-- Cette migration doit s'exécuter AVANT 20260114143520_staging_to_prod.sql
-- ============================================================================

-- Supprimer les doublons : garder seulement la subscription la plus récente par user_id
DELETE FROM "public"."subscriptions"
WHERE ctid IN (
  SELECT s1.ctid
  FROM "public"."subscriptions" s1
  WHERE EXISTS (
    SELECT 1
    FROM "public"."subscriptions" s2
    WHERE s2.user_id = s1.user_id
      AND s2.created_at > s1.created_at
  )
);

RAISE NOTICE 'Doublons supprimés. Seule la subscription la plus récente est conservée par utilisateur.';

-- Vérification
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO duplicate_count
  FROM (
    SELECT user_id
    FROM "public"."subscriptions"
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Il reste % utilisateurs avec des subscriptions en doublon', duplicate_count;
  ELSE
    RAISE NOTICE 'Aucun doublon détecté. Migration réussie.';
  END IF;
END $$;
