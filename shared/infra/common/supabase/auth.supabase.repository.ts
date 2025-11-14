import { type JwtPayload, SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "~~/shared/application/common/providers/auth/auth.repository";
import {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/application/common/providers/auth/dto/auth.dto";
import type { Database } from "./database.types";
import { SupabaseError } from "./supabase.error";
import {
    AuthEvent,
    type AuthEventData,
} from "~~/shared/application/common/providers/auth/auth.event.emitter";

export default class AuthSupabaseRepository implements AuthRepository {
    private eventCallbacks: Map<AuthEvent, ((data: AuthEventData) => void)[]> =
        new Map();

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
        const { public: { baseUrl } } = useRuntimeConfig();
        this.baseUrl = baseUrl;
        if (user != null) {
            this._connectedUser = new AuthUserModel(user.sub, user.email ?? "");
        }
        this.supabaseClient.auth.onAuthStateChange((event) => {
            console.log("Auth state changed:", event);
            switch (event) {
                case "SIGNED_IN":
                    this.onLogin();
                    break;
                case "SIGNED_OUT":
                    this.onLogout();
                    break;
                default:
                    break;
            }
        });
    }

    on(event: AuthEvent, callback: (data: AuthEventData) => void): void {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event)!.push(callback);
    }

    off(event: AuthEvent, callback: (data: AuthEventData) => void): void {
        const callbacks = this.eventCallbacks.get(event);
        if (!callbacks) return;
        this.eventCallbacks.set(
            event,
            callbacks.filter((cb) => cb !== callback),
        );
    }

    emit(event: AuthEvent, data: AuthEventData): void {
        const callbacks = this.eventCallbacks.get(event);
        if (!callbacks) return;
        callbacks.forEach((callback) => callback(data));
    }

    async onLogin() {
        if (this._connectedUser) return;
        const { data, error } = await this.supabaseClient.auth.getUser();
        console.log("onLogin user data:", error);
        if (error) throw SupabaseError.fromPostgrest(error);
        if (data.user) {
            this._connectedUser = new AuthUserModel(
                data.user.id,
                data.user.email ?? "",
            );
        }
        this.emit(AuthEvent.SIGNED_IN, {
            user: this._connectedUser,
            timestamp: new Date(),
        });
    }

    async onLogout() {
        this._connectedUser = null;
        this.emit(AuthEvent.SIGNED_OUT, {
            user: null,
            timestamp: new Date(),
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
