// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/ui-pro",
    "nuxt-resend",
    "@nuxt/content",
    "@nuxtjs/sitemap",
    "@nuxt/image",
  ],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
      vpvLicenseKey: process.env.NUXT_VPV_LICENSE_KEY || "",
    },
  },
  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },
  supabase: {
    redirect: true,
    key: process.env.SUPABASE_ANON_KEY || "",
    url: process.env.SUPABASE_URL || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      include: ["/app/**"],
    },
  },
  icon: {
    customCollections: [{
      prefix: "custom",
      dir: "./assets/icons",
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
    exclude: ["/auth/**", "/app/**"],
    include: ["/"],
  },
});
