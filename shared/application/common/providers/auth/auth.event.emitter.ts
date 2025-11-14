import type { AnonymousAuthUserModel, AuthUserModel } from "./dto/auth.dto";

export enum AuthEvent {
    SIGNED_IN = "SIGNED_IN",
    SIGNED_OUT = "SIGNED_OUT",
    PASSWORD_RECOVERY = "PASSWORD_RECOVERY",
    INITIAL_SESSION = "INITIAL_SESSION",
    TOKEN_REFRESHED = "TOKEN_REFRESHED",
    USER_UPDATED = "USER_UPDATED",
}

export interface AuthEventData {
    user?: AuthUserModel | AnonymousAuthUserModel | null;
    timestamp: Date;
}

export interface AuthEventEmitter {
    on(event: AuthEvent, callback: (data: AuthEventData) => void): void;
    off(event: AuthEvent, callback: (data: AuthEventData) => void): void;
    emit(event: AuthEvent, data: AuthEventData): void;
}
