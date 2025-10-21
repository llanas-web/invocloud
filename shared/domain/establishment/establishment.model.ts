import type { UserModel } from "~~/shared/types/models/user.model";
import type { ModelCommonUpdateProps } from "../common/common.interface";
import { PayloadModel } from "../common/payload.model";
import { MemberEntity, MemberStatus } from "./member.entity";

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
    members?: MemberEntity[];
};

export type DraftEstablishment = Omit<
    EstablishmentModelProps,
    "id" | "createdAt" | "updatedAt"
>;

export class EstablishmentModel extends PayloadModel {
    static override payloadType: string = "EstablishmentModel";

    private constructor(readonly props: EstablishmentModelProps) {
        super();
        this.props = {
            ...props,
            members: props.members ?? [],
        };
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

    get members() {
        return this.props.members ?? [];
    }

    // ─── Business Logic: Member Management ───

    /**
     * Invite un nouveau membre (crée un membre en statut PENDING)
     */
    inviteMember(userId: string, user: UserModel): EstablishmentModel {
        // Vérifier que l'utilisateur n'est pas déjà membre
        if (this.hasMember(userId)) {
            throw new Error(
                `L'utilisateur ${userId} est déjà membre de cet établissement`,
            );
        }

        const newMember = MemberEntity.createFromUser(user);

        return new EstablishmentModel({
            ...this.props,
            members: [...this.members, newMember],
        });
    }

    /**
     * Accepte l'invitation d'un membre
     */
    acceptMember(userId: string): EstablishmentModel {
        const memberIndex = this.members.findIndex((m) => m.userId === userId);
        if (memberIndex === -1) {
            throw new Error(`Membre ${userId} non trouvé`);
        }

        const updatedMembers = [...this.members];
        updatedMembers[memberIndex] = updatedMembers[memberIndex]!.accept();

        return new EstablishmentModel({
            ...this.props,
            members: updatedMembers,
        });
    }

    /**
     * Refuse l'invitation d'un membre
     */
    declineMember(userId: string): EstablishmentModel {
        const memberIndex = this.members.findIndex((m) => m.userId === userId);
        if (memberIndex === -1) {
            throw new Error(`Membre ${userId} non trouvé`);
        }

        const updatedMembers = [...this.members];
        updatedMembers[memberIndex] = updatedMembers[memberIndex]!.decline();

        return new EstablishmentModel({
            ...this.props,
            members: updatedMembers,
        });
    }

    /**
     * Retire un membre
     */
    removeMember(userId: string): EstablishmentModel {
        if (userId === this.creatorId) {
            throw new Error(
                "Le créateur ne peut pas être retiré de l'établissement",
            );
        }

        return new EstablishmentModel({
            ...this.props,
            members: this.members.filter((m) => m.userId !== userId),
        });
    }

    /**
     * Vérifie si un utilisateur est membre
     */
    hasMember(userId: string): boolean {
        return this.members.some((m) => m.userId === userId);
    }

    /**
     * Récupère un membre spécifique
     */
    getMember(userId: string): MemberEntity | undefined {
        return this.members.find((m) => m.userId === userId);
    }

    /**
     * Récupère tous les membres acceptés
     */
    getAcceptedMembers(): MemberEntity[] {
        return this.members.filter((m) => m.status === MemberStatus.ACCEPTED);
    }

    /**
     * Récupère tous les membres en attente
     */
    getPendingMembers(): MemberEntity[] {
        return this.members.filter((m) => m.status === MemberStatus.PENDING);
    }

    // ─── Existing methods ───
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
            members: this.members.map((m) => ({
                userId: m.userId,
                role: m.role,
                status: m.status,
            })),
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
            members: (data.members ?? []).map((m: any) =>
                MemberEntity.create({
                    userId: m.userId,
                    role: m.role,
                    status: m.status,
                })
            ),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    }

    override fromPayload(data: any): this {
        return EstablishmentModel.fromPayload(data) as this;
    }
}
