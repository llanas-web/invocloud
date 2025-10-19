export default defineNuxtRouteMiddleware(() => {
    const session = useSupabaseSession();
    const user = useSupabaseUser();
    const loggedIn = useState("loggedIn", () => {
        return session.value !== null && user.value !== null &&
            !user.value.is_anonymous;
    });
    console.log("Middleware - loggedIn:", loggedIn.value);

    // redirect the user to the login screen if they're not authenticated
    if (loggedIn.value) {
        return navigateTo("/app");
    }
});
