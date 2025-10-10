import type {
    AnonymousAuthUserModel,
    AuthUserModel,
} from "~~/shared/models/auth-user.model";

export interface AuthInterface {
    signInWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel>;

    anonymousSignIn(): Promise<AnonymousAuthUserModel>;

    signUpWithPassword(
        email: string,
        password: string,
    ): Promise<AuthUserModel>;

    signOut(): Promise<void>;

    sendPasswordResetEmail(email: string): Promise<void>;
}
