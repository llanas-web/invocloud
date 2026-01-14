-- ============================================================================
-- MIGRATION DE DONNÉES : Préparation avant le changement de schéma
-- ============================================================================
-- Cette migration doit s'exécuter AVANT 20260114142531_staging_to_prod.sql
-- Elle prépare les données pour la transition subscriptions : establishment → user
-- ============================================================================

-- 1. Créer la table subscription_plans
CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "name" text NOT NULL,
  "provider_product_id" text NOT NULL,
  "included_invoices" smallint NOT NULL,
  "max_establishments" smallint NOT NULL,
  "max_members" smallint NOT NULL,
  "price" smallint NOT NULL,
  "subscription_price_id" text NOT NULL,
  "metric_price_id" text NOT NULL,
  "metric_id" text NOT NULL,
  "has_inbound_feature" boolean NOT NULL DEFAULT true,
  "has_ocr_feature" boolean NOT NULL DEFAULT true,
  PRIMARY KEY (id),
  UNIQUE (name)
);

-- 2. Insérer les plans de subscription (starter et pro)
-- NOTE: Remplacez les valeurs prod_XXX, price_XXX, mtr_XXX par vos vraies valeurs Stripe
INSERT INTO "public"."subscription_plans" (
  name, 
  provider_product_id, 
  included_invoices, 
  max_establishments, 
  max_members, 
  price, 
  subscription_price_id, 
  metric_price_id, 
  metric_id, 
  has_inbound_feature, 
  has_ocr_feature
)
VALUES 
  -- Plan Starter
  (
    'starter',
    'starter_produdct_id',  -- TODO: Remplacer par votre product_id Stripe
    200,
    1,
    3,
    2990,
    'starter_price_id',  -- TODO: Remplacer par votre price_id Stripe
    'starter_metric_price_id',  -- TODO: Remplacer par votre metric_price_id
    'starter_metric_id',  -- TODO: Remplacer par votre metric_id
    false,
    false
  ),
  -- Plan Pro
  (
    'pro',
    'pro_product_id',  -- TODO: Remplacer par votre product_id Stripe
    1000,
    3,
    10,
    4990,
    'pro_price_id',  -- TODO: Remplacer par votre price_id Stripe
    'pro_metric_price_id',  -- TODO: Remplacer par votre metric_price_id
    'pro_metric_id',  -- TODO: Remplacer par votre metric_id
    true,
    true
  )
ON CONFLICT (name) DO NOTHING;  -- Ne rien faire si les plans existent déjà

-- 3. Vérifier que les colonnes à migrer existent avant de continuer
DO $$ 
BEGIN
  -- Vérifier si establishment_id existe dans subscriptions
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
      AND column_name = 'establishment_id'
      AND table_schema = 'public'
  ) THEN
    
    -- 4. Ajouter temporairement les nouvelles colonnes (si elles n'existent pas)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE "public"."subscriptions" ADD COLUMN "user_id" uuid;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'subscriptions' AND column_name = 'subscription_plan_id'
    ) THEN
      ALTER TABLE "public"."subscriptions" ADD COLUMN "subscription_plan_id" uuid;
    END IF;

    -- 5. Migrer les données : establishment_id → user_id (creator)
    -- On assigne la subscription au créateur de l'establishment
    UPDATE "public"."subscriptions" s
    SET 
      user_id = e.creator_id,
      subscription_plan_id = (
        SELECT id 
        FROM "public"."subscription_plans" 
        WHERE name = 'starter'  -- Par défaut, on met tout le monde en starter
        LIMIT 1
      )
    FROM "public"."establishments" e
    WHERE s.establishment_id = e.id
      AND s.user_id IS NULL;  -- Ne migrer que les lignes pas encore migrées

    -- 5b. Supprimer les doublons : garder seulement la subscription la plus récente par user_id
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

    -- 6. Vérification : afficher les subscriptions non migrées
    RAISE NOTICE 'Migration des subscriptions terminée';
    RAISE NOTICE 'Nombre de subscriptions migrées : %', (
      SELECT COUNT(*) 
      FROM "public"."subscriptions" 
      WHERE user_id IS NOT NULL
    );
    RAISE NOTICE 'Nombre de subscriptions NON migrées (user_id NULL) : %', (
      SELECT COUNT(*) 
      FROM "public"."subscriptions" 
      WHERE user_id IS NULL
    );

    -- 7. Ajouter les contraintes NOT NULL après migration
    -- NOTE: Ces contraintes seront recréées dans la migration de schéma
    -- On ne les ajoute ici QUE si toutes les données sont migrées
    IF NOT EXISTS (
      SELECT 1 FROM "public"."subscriptions" WHERE user_id IS NULL
    ) THEN
      ALTER TABLE "public"."subscriptions" ALTER COLUMN "user_id" SET NOT NULL;
      ALTER TABLE "public"."subscriptions" ALTER COLUMN "subscription_plan_id" SET NOT NULL;
      RAISE NOTICE 'Contraintes NOT NULL ajoutées avec succès';
    ELSE
      RAISE WARNING 'Certaines subscriptions n''ont pas été migrées. Contraintes NOT NULL non ajoutées.';
    END IF;

  ELSE
    RAISE NOTICE 'La colonne establishment_id n''existe pas dans subscriptions. Migration probablement déjà effectuée.';
  END IF;
END $$;
