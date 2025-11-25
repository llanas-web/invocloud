import type { SubscriptionStatus } from "~~/shared/domain/user/subscription.entity";

export type UserListItemDTO = {
    id: string;
    fullName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

export type SubscriptionDTO = {
    planId: string;
    status: SubscriptionStatus;
    endAt: Date | null;
};

export type UserDetailsDTO = {
    id: string;
    fullName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    favoriteEstablishmentId: string | null;
    subscription: SubscriptionDTO | null;
};
