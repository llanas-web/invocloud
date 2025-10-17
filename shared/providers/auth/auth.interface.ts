import type {
    AnonymousAuthUserModel,
    AuthEvent,
    AuthUserModel,
} from "~~/shared/types/models/auth-user.model";

export interface AuthInterface {
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
    }): Promise<void>;

    updateUser(userId: string, updates: {
        password?: string;
    }): Promise<void>;
}
