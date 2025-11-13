export default defineNuxtRouteMiddleware((middleware) => {
    const { $authRepository } = useNuxtApp();
    if (middleware.path === "/") return;
    if (!$authRepository.connectedUser) {
        if (!middleware.path.startsWith("/auth")) {
            return navigateTo("/auth/login");
        }
    } else {
        if (middleware.path.startsWith("/auth")) return navigateTo("/app");
    }
});
