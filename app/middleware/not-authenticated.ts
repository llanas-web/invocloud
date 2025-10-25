export default defineNuxtRouteMiddleware(() => {
    const { connectedUser } = useAuth();
    const loggedIn = useState("loggedIn", () => {
        return connectedUser.value !== null && !connectedUser.value.isAnonymous;
    });
    console.log("Middleware - loggedIn:", loggedIn.value);

    // redirect the user to the login screen if they're not authenticated
    if (loggedIn.value) {
        return navigateTo("/app");
    }
});
