// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/supabase", "@nuxt/ui-pro", "nuxt-resend"],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  supabase: {
    redirect: true,
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      exclude: ["/", "/auth/*"],
    },
  },
});
