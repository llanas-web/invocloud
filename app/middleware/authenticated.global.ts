export default defineNuxtRouteMiddleware((middleware) => {
    const user = useSupabaseUser();
    if (middleware.path === "/") return;
    if (!user.value) {
        if (!middleware.path.startsWith("/auth")) {
            return navigateTo("/auth/login");
        }
    } else {
        if (middleware.path.startsWith("/auth")) return navigateTo("/app");
    }
});
