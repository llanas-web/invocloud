-- ============================================================================
-- MIGRATION : Nettoyage des fonctions et objets non utilisés
-- ============================================================================
-- Cette migration nettoie les anciennes fonctions, triggers et extensions
-- qui ne sont plus utilisés après la refonte des subscriptions
-- ============================================================================

-- 1. Supprimer les anciennes fonctions liées aux subscriptions (déjà dans staging_to_prod mais on s'assure)
DROP FUNCTION IF EXISTS "public"."establishment_has_active_subscription"(establishment_id uuid);
DROP FUNCTION IF EXISTS "public"."prevent_delete_establishment_if_active"();
DROP FUNCTION IF EXISTS "public"."prevent_delete_user_if_active_sub"();
DROP FUNCTION IF EXISTS "public"."user_has_active_billing_establishments"(user_id uuid);

-- 2. Supprimer les anciens triggers
DROP TRIGGER IF EXISTS "trg_prevent_delete_establishment_if_active" ON "public"."establishments";
DROP TRIGGER IF EXISTS "trg_prevent_delete_user_if_active_sub" ON "public"."users";

-- 3. Supprimer l'extension pgjwt si elle n'est plus utilisée
DROP EXTENSION IF EXISTS "pgjwt";

-- 4. Afficher un résumé
DO $$ 
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Nettoyage terminé avec succès';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Fonctions supprimées :';
  RAISE NOTICE '  - establishment_has_active_subscription()';
  RAISE NOTICE '  - prevent_delete_establishment_if_active()';
  RAISE NOTICE '  - prevent_delete_user_if_active_sub()';
  RAISE NOTICE '  - user_has_active_billing_establishments()';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers supprimés :';
  RAISE NOTICE '  - trg_prevent_delete_establishment_if_active';
  RAISE NOTICE '  - trg_prevent_delete_user_if_active_sub';
  RAISE NOTICE '';
  RAISE NOTICE 'Extensions supprimées :';
  RAISE NOTICE '  - pgjwt';
  RAISE NOTICE '=================================================';
END $$;
