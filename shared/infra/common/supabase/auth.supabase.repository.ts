import { AuthError, type SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/application/common/providers/auth/dto/auth.dto";
import { AuthEvent } from "~~/shared/application/common/providers/auth/types";
import type { Database } from "./database.types";

export default class AuthSupabaseRepository implements AuthRepository {
    private _connectedUser: AuthUserModel | AnonymousAuthUserModel | null =
        null;

    get connectedUser() {
        return this._connectedUser;
    }

    constructor(private supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient.auth.onAuthStateChange((event, session) => {
            const _event = event as AuthEvent;
            this.onAuthChange(
                _event,
                session?.user != null
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
        user: AnonymousAuthUserModel | AuthUserModel | null,
    ): void {
        switch (event) {
            case AuthEvent.INITIAL_SESSION:
            case AuthEvent.SIGNED_IN:
                this._connectedUser = user;
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
        if (error) throw new AuthError(error.message);
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
        if (error) throw new AuthError(error.message);
        if (!data.user) {
            throw new AuthError("No user returned from anonymous sign-in");
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
            {
                redirectTo: `${import.meta.env.BASE_URL}/auth/update-password`,
            },
        );
        if (error) throw new AuthError(error.message);
    }

    async inviteUser(email: string, options: {
        establishmentId: string;
        invitorId: string;
        redirection: string;
    }) {
        const { data, error } = await this.supabaseClient.auth.admin
            .inviteUserByEmail(email, {
                data: {
                    establishment_id: options.establishmentId,
                    invitor_id: options.invitorId,
                },
                redirectTo: options.redirection,
            });
        if (error) throw new AuthError(error.message);
        return data.user.id;
    }

    async updateUser(userId: string, updates: {
        password?: string;
    }): Promise<void> {
        const { error } = await this.supabaseClient.auth.admin.updateUserById(
            userId,
            {
                password: updates.password,
            },
        );
        if (error) throw new AuthError(error.message);
    }
}
