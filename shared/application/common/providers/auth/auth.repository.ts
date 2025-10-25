import type { AnonymousAuthUserModel, AuthUserModel } from "./dto/auth.dto";
import type { AuthEvent } from "./types";

export interface AuthRepository {
    currentUser: AuthUserModel | AnonymousAuthUserModel | null;

    onAuthChange(
        callback: (event: AuthEvent, user: AuthUserModel | null) => void,
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
