import type { AnonymousAuthUserModel, AuthUserModel } from "./dto/auth.dto";
import type { AuthEvent } from "./types";

export interface AuthRepository {
    readonly connectedUser: AuthUserModel | AnonymousAuthUserModel | null;

    onAuthChange(
        event: AuthEvent,
        user: AnonymousAuthUserModel | AuthUserModel | null,
    ): void;

    signInWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel>;

    anonymousSignIn(
        email: string,
    ): Promise<AnonymousAuthUserModel>;

    signUpWithPassword(
        email: string,
        password: string,
        options: object,
    ): Promise<AuthUserModel>;

    signOut(): Promise<void>;

    sendPasswordResetEmail(email: string): Promise<void>;

    inviteUser(email: string, options: {
        establishmentId: string;
        invitorId: string;
        redirection: string;
    }): Promise<string>;

    updateUser(userId: string, updates: {
        password?: string;
    }): Promise<void>;
}
