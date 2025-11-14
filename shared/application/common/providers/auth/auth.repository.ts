import type { AuthEvent, AuthEventEmitter } from "./auth.event.emitter";
import type { AnonymousAuthUserModel, AuthUserModel } from "./dto/auth.dto";

export interface AuthRepository extends AuthEventEmitter {
    readonly connectedUser: AuthUserModel | AnonymousAuthUserModel | null;

    getCurrentUser(): Promise<
        AuthUserModel | AnonymousAuthUserModel | null
    >;

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
}
