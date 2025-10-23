import type { ModelCommonUpdateProps } from "../common/common.interface";
import { PayloadModel } from "../common/payload.model";

export type UserModelProps =
    & ModelCommonUpdateProps
    & UserRequiredProps
    & UserMutableProps;

export type UserRequiredProps = {
    email: string;
};

export type UserMutableProps = {
    fullName?: string | null;
};

export type DraftUser = Omit<
    UserModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class UserModel extends PayloadModel {
    static override payloadType: string = "UserModel";

    private constructor(readonly props: UserModelProps) {
        super();
        this.props = props;
    }

    static create(props: UserModelProps): UserModel {
        return new UserModel(props);
    }

    // ─── Core getters ───
    get id() {
        return this.props.id;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    // ─── Required fields ───
    get email() {
        return this.props.email;
    }
    // ─── Optional fields ───
    get fullName() {
        return this.props.fullName ?? null;
    }

    withDetails(details: Partial<UserMutableProps>): UserModel {
        return UserModel.create({
            ...this.props,
            ...details,
        });
    }

    override toPayload(): Record<string, any> {
        return {
            id: this.id,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            fullName: this.fullName,
        };
    }

    override fromPayload(data: any): this {
        return UserModel.create({
            id: data.id,
            email: data.email,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            fullName: data.fullName,
        }) as this;
    }
}
