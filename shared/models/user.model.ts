export class UserModel {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    fullName: string | null;

    constructor(
        id: string,
        email: string,
        createdAt: Date,
        updatedAt: Date,
        fullName: string | null,
    ) {
        this.id = id;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.fullName = fullName;
    }
}
