import type { UserModel } from "~~/shared/types/models/user.model";
import type { ModelCommonUpdateProps } from "../common/common.interface";
import { PayloadModel } from "../common/payload.model";
import { MemberEntity, MemberStatus } from "./member.entity";
import { SubscriptionEntity } from "./subscription.entity";
import { DomainError, DomainErrorCode } from "../common/errors/domain.error";

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
    subscription?: SubscriptionEntity | null;
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
            subscription: props.subscription ?? null,
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

    get subscription() {
        return this.props.subscription ?? null;
    }

    // ─── Business Logic: Member Management ───

    /**
     * Invite un nouveau membre (crée un membre en statut PENDING)
     */
    inviteMember(userId: string, user: UserModel): EstablishmentModel {
        // Vérifier que l'utilisateur n'est pas déjà membre
        if (this.hasMember(userId)) {
            throw new DomainError(
                DomainErrorCode.ENTITY_ALREADY_EXISTS,
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

    // ─── Business Logic: Subscription Management ───

    /**
     * Vérifie si l'établissement a un abonnement actif
     */
    hasActiveSubscription(): boolean {
        return this.props.subscription?.isActive() ?? false;
    }

    /**
     * Vérifie si l'établissement peut être supprimé
     */
    canBeDeleted(): boolean {
        return !this.hasActiveSubscription();
    }

    /**
     * Ajoute un abonnement à l'établissement
     */
    withSubscription(subscription: SubscriptionEntity): EstablishmentModel {
        if (this.props.subscription !== null) {
            throw new Error(
                "Cet établissement a déjà un abonnement",
            );
        }
        return new EstablishmentModel({
            ...this.props,
            subscription,
        });
    }

    /**
     * Met à jour l'abonnement
     */
    updateSubscription(
        updater: (subscription: SubscriptionEntity) => SubscriptionEntity,
    ): EstablishmentModel {
        if (!this.props.subscription) {
            throw new Error(
                "Cet établissement n'a pas d'abonnement",
            );
        }
        return new EstablishmentModel({
            ...this.props,
            subscription: updater(this.props.subscription),
        });
    }

    /**
     * Active l'abonnement (sortie de période d'essai)
     */
    activateSubscription(
        periodEnd: Date,
        periodStart?: Date,
    ): EstablishmentModel {
        return this.updateSubscription((sub) =>
            sub.activate(periodEnd, periodStart)
        );
    }

    /**
     * Renouvelle l'abonnement
     */
    renewSubscription(periodEnd: Date): EstablishmentModel {
        return this.updateSubscription((sub) => sub.renew(periodEnd));
    }

    /**
     * Annule l'abonnement
     */
    cancelSubscription(cancelAt: Date): EstablishmentModel {
        return this.updateSubscription((sub) => sub.cancel(cancelAt));
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
            subscription: this.props.subscription
                ? {
                    status: this.props.subscription.status,
                    startAt: this.props.subscription.startAt,
                    endAt: this.props.subscription.endAt,
                    cancelAt: this.props.subscription.cancelAt,
                    canceledAt: this.props.subscription.canceledAt,
                    currentPeriodStart: this.props.subscription
                        .currentPeriodStart,
                    currentPeriodEnd: this.props.subscription.currentPeriodEnd,
                    providerSubscriptionId:
                        this.props.subscription.providerSubscriptionId,
                    providerCustomerId:
                        this.props.subscription.providerCustomerId,
                }
                : null,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }

    static fromPayload(data: any): EstablishmentModel {
        return new EstablishmentModel({
            id: data.id,
            creatorId: data.creatorId,
            name: data.name,
            emailPrefix: data.emailPrefix,
            address: data.address,
            phone: data.phone,
            members: data.members?.map((m: any) => MemberEntity.create(m)) ??
                [],
            subscription: data.subscription
                ? SubscriptionEntity.create(data.subscription)
                : null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    override fromPayload(data: any): this {
        return EstablishmentModel.fromPayload(data) as this;
    }
}
