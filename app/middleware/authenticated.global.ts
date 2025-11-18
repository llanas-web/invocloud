const publicPath = [
    "/",
    "/tarifs",
    "/pdc",
    "/faq",
    "/cgu",
];

const connectedAuthPaths = [
    "/auth/update-password",
];

export default defineNuxtRouteMiddleware((middleware) => {
    const { $authRepository } = useNuxtApp();
    if (publicPath.includes(middleware.path)) return;
    if (!$authRepository.connectedUser) {
        if (!middleware.path.startsWith("/auth")) {
            return navigateTo("/auth/login");
        }
    } else {
        if (
            middleware.path.startsWith("/auth") &&
            !connectedAuthPaths.includes(middleware.path)
        ) return navigateTo("/app");
    }
});
