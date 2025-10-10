import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthInterface } from "../auth.interface";
import {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/models/auth-user.model";
import type { BaseAuthUserModel } from "~~/shared/models/auth-user.model";
import AuthError from "../auth-error";

export default class SupabaseAuthRepository implements AuthInterface {
    constructor(private supabaseClient: SupabaseClient) {}

    currentUser: BaseAuthUserModel | null = null;

    async signInWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel> {
        const { data, error } = await this.supabaseClient.auth
            .signInWithPassword({
                email,
                password,
            });
        if (error) throw new AuthError(error.message);
        return new AuthUserModel(
            data.user.id,
            data.user.email!,
        );
    }

    async anonymousSignIn(): Promise<AnonymousAuthUserModel> {
        const { data, error } = await this.supabaseClient.auth
            .signInAnonymously();
        if (error) throw new AuthError(error.message);
        if (!data.user) {
            throw new AuthError("No user returned from anonymous sign-in");
        }
        return new AnonymousAuthUserModel(data.user.id);
    }

    async signUpWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel> {
        const { data, error } = await this.supabaseClient.auth.signUp({
            email,
            password,
        });
        if (error) throw new AuthError(error.message);
        if (!data.user) {
            throw new AuthError("No user returned from sign-up");
        }
        return new AuthUserModel(data.user.id, data.user.email!);
    }

    async signOut(): Promise<void> {
        const { error } = await this.supabaseClient.auth.signOut();
        if (error) throw new AuthError(error.message);
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        const { error } = await this.supabaseClient.auth.resetPasswordForEmail(
            email,
        );
        if (error) throw new AuthError(error.message);
    }
}
