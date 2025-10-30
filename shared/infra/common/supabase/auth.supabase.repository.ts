import { type JwtPayload, SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/application/common/providers/auth/dto/auth.dto";
import { AuthEvent } from "~~/shared/application/common/providers/auth/types";
import type { Database } from "./database.types";
import { SupabaseError } from "./supabase.error";

export default class AuthSupabaseRepository implements AuthRepository {
    private _connectedUser: AuthUserModel | AnonymousAuthUserModel | null =
        null;
    private baseUrl: string;

    get connectedUser() {
        return this._connectedUser;
    }

    constructor(
        private supabaseClient: SupabaseClient<Database>,
        user: JwtPayload | null,
    ) {
        const { baseUrl } = useRuntimeConfig();
        this.baseUrl = baseUrl;
        if (user != null) {
            this._connectedUser = new AuthUserModel(user.sub, user.email ?? "");
        }
        this.supabaseClient.auth.onAuthStateChange((event, session) => {
            const _event = event as AuthEvent;
            this.onAuthChange(
                _event,
                session?.user
                    ? new AuthUserModel(
                        session.user.id,
                        session.user.email ?? "",
                    )
                    : null,
            );
        });
    }

    async getCurrentUser(): Promise<
        AuthUserModel | AnonymousAuthUserModel | null
    > {
        const { data } = await this.supabaseClient.auth.getUser();
        this._connectedUser = data.user
            ? new AuthUserModel(data.user.id, data.user.email ?? "")
            : null;
        return this._connectedUser;
    }

    onAuthChange(
        event: AuthEvent,
        user?: AnonymousAuthUserModel | AuthUserModel | null,
    ) {
        switch (event) {
            case AuthEvent.INITIAL_SESSION:
            case AuthEvent.SIGNED_IN:
                this._connectedUser = user || null;
                break;
            case AuthEvent.SIGNED_OUT:
                this._connectedUser = null;
                break;
        }
    }

    async signInWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel> {
        const { data, error } = await this.supabaseClient.auth
            .signInWithPassword({
                email,
                password,
            });
        if (error) throw SupabaseError.fromPostgrest(error);
        return new AuthUserModel(
            data.user.id,
            data.user.email!,
        );
    }

    async anonymousSignIn(email: string) {
        const { data, error } = await this.supabaseClient.auth
            .signInAnonymously({
                options: { data: { email } },
            });
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data.user) {
            throw new SupabaseError(
                "AUTH_ERROR",
                "No user returned from anonymous sign-in",
            );
        }
        return new AnonymousAuthUserModel(data.user.id);
    }

    async signUpWithPassword(
        email: string,
        password: string,
        options: object,
    ): Promise<AuthUserModel> {
        const { data, error } = await this.supabaseClient.auth.signUp({
            email,
            password,
            options,
        });
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data.user) {
            throw new SupabaseError(
                "AUTH_ERROR",
                "No user returned from sign-up",
            );
        }
        return new AuthUserModel(data.user.id, data.user.email!);
    }

    async signOut(): Promise<void> {
        const { error } = await this.supabaseClient.auth.signOut();
        if (error) throw SupabaseError.fromPostgrest(error);
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        const { error } = await this.supabaseClient.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${this.baseUrl}/auth/update-password`,
            },
        );
        if (error) throw SupabaseError.fromPostgrest(error);
    }
}
