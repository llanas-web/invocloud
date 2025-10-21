import type { ModelCommonUpdateProps } from "../common/common.interface";
import { PayloadModel } from "../common/payload.model";

export type EstablishmentModelProps =
    & ModelCommonUpdateProps
    & EstablishmentImmutableProps
    & EstablishmentMutableProps;

export type EstablishmentImmutableProps = {
    creatorId: string;
};

export type EstablishmentMutableProps = {
    name: string;
    emailPrefix: string;
    address?: string | null;
    phone?: string | null;
};

export type DraftEstablishment = Omit<
    EstablishmentModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class EstablishmentModel extends PayloadModel {
    static override payloadType: string = "EstablishmentModel";

    private constructor(readonly props: EstablishmentModelProps) {
        super();
        this.props = props;
    }

    static createDraft(
        props: DraftEstablishment,
    ): DraftEstablishment {
        return { ...props };
    }

    static create(props: EstablishmentModelProps): EstablishmentModel {
        return new EstablishmentModel(props);
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
    get creatorId() {
        return this.props.creatorId;
    }

    // ─── Mutable fields ───
    get name() {
        return this.props.name;
    }
    get emailPrefix() {
        return this.props.emailPrefix;
    }
    get address() {
        return this.props.address ?? null;
    }
    get phone() {
        return this.props.phone ?? null;
    }

    withDetails(patch: Partial<EstablishmentMutableProps>): EstablishmentModel {
        return new EstablishmentModel({
            ...this.props,
            name: patch.name ?? this.props.name ?? null,
            emailPrefix: patch.emailPrefix ?? this.props.emailPrefix ?? null,
            address: patch.address ?? this.props.address ?? null,
            phone: patch.phone ?? this.props.phone ?? null,
        });
    }

    override toPayload(): Record<string, any> {
        return {
            id: this.props.id,
            creatorId: this.props.creatorId,
            name: this.props.name,
            emailPrefix: this.props.emailPrefix,
            address: this.props.address,
            phone: this.props.phone,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }

    static fromPayload(data: any): EstablishmentModel {
        return EstablishmentModel.create({
            id: data.id,
            creatorId: data.creatorId,
            name: data.name,
            emailPrefix: data.emailPrefix,
            address: data.address,
            phone: data.phone,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }

    override fromPayload(data: any): this {
        return EstablishmentModel.fromPayload(data) as this;
    }
}
