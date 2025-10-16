export abstract class BaseAuthUserModel {
    constructor(
        public id: string,
        public isAnonymous: boolean,
    ) {}
}

export class AuthUserModel extends BaseAuthUserModel {
    constructor(
        id: string,
        public email: string,
    ) {
        super(id, false);
    }
}

export class AnonymousAuthUserModel extends BaseAuthUserModel {
    constructor(id: string) {
        super(id, true);
    }
}

export enum AuthEvent {
    SIGNED_IN = "SIGNED_IN",
    SIGNED_OUT = "SIGNED_OUT",
    PASSWORD_RECOVERY = "PASSWORD_RECOVERY",
}
