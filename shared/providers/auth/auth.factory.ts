import type { AuthInterface } from "./auth.interface";
import type { SupabaseClient } from "@supabase/supabase-js";
import SupabaseAuthRepository from "./supabase/auth.repository";
import AuthError from "./auth.error";

class AuthFactory {
    private static instance: AuthInterface;

    private constructor(client: SupabaseClient) {
        AuthFactory.instance = new SupabaseAuthRepository(client);
    }

    public static getInstance(client: SupabaseClient): AuthInterface {
        if (!AuthFactory.instance) {
            new AuthFactory(client);
        }
        return AuthFactory.instance;
    }

    public static getAuthRepository(): AuthInterface {
        if (!AuthFactory.instance) {
            throw new AuthError(
                "AuthFactory not initialized. Call getInstance first.",
            );
        }
        return AuthFactory.instance;
    }
}

export default AuthFactory;
