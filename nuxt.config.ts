// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  nitro: {
    rollupConfig: { external: ["sharp", "canvas", "pdf-lib"] },
    preset: "vercel",
  },
  vite: {
    optimizeDeps: {
      exclude: ["canvas"],
    },
    worker: {
      format: "es",
      rollupOptions: { output: { format: "es" } },
    },
  },
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/ui",
    "nuxt-resend",
    "@nuxt/content",
    "@nuxtjs/sitemap",
    "@nuxt/image",
    "@nuxtjs/robots",
  ],
  runtimeConfig: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    // Email Resend
    emailFrom: process.env.RESEND_EMAIL_FROM || "",
    resendApiKey: process.env.RESEND_API_KEY || "",

    // Inbound Mail Basic Auth
    inboundBasicUser: process.env.INBOUND_BASIC_USER || "",
    inboundBasicPass: process.env.INBOUND_BASIC_PASS || "",

    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripePriceId: process.env.STRIPE_PRICE_ID || "",
    stripeApiVersion: process.env.STRIPE_API_VERSION || "2025-09-30.clover",
    // Mindee OCR
    mindeeApiKey: process.env.MINDEE_API_KEY || "",
    mindeeModelId: process.env.MINDEE_MODEL_ID || "",
    mindeeWebhookId: process.env.MINDEE_WEBHOOK_ID || "",
    mindeeWebhookSecret: process.env.MINDEE_WEBHOOK_SECRET || "",
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      vpvLicenseKey: process.env.NUXT_PUBLIC_VPV_LICENSE_KEY || "",
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    },
  },
  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },
  supabase: {
    redirect: false,
    key: process.env.SUPABASE_ANON_KEY || "",
    url: process.env.SUPABASE_URL || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  icon: {
    customCollections: [{
      prefix: "custom",
      dir: "./app/assets/icons",
    }],
  },
  ui: {
    colorMode: false,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
    },
  },
  site: {
    url: process.env.BASE_URL || "http://localhost:3000",
    defaultLocale: "fr",
    locales: ["fr", "en"],
    name: "Invocloud",
    description: "Gérez vos factures en toute simplicité",
  },
  sitemap: {
    exclude: [
      "/app/**",
      "/auth/callback",
      "/auth/confirm",
      "/auth/forgot-password",
      "/auth/update-password",
    ],
    include: ["/", "/auth/login", "/auth/sign-up", "/faq", "/cgu"],
  },
});
