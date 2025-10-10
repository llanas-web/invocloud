import {
    EstablishmentModel,
    type EstablishmentModelInsert,
    type EstablishmentShortModel,
} from "#shared/models/establishment.model";
import { fromStringToLocalDate } from "#shared/utils/date.utils";
import {
    SubscriptionModel,
    SubscriptionProvider,
    SubscriptionStatus,
} from "~~/shared/models/subscription.model";
import type {
    Establishment,
    EstablishmentInsert,
} from "~~/types/providers/database";

export const establishmentMapperFromDatabase = (
    supabaseEstablishment: Establishment,
): EstablishmentModel => {
    const newEstablishment = new EstablishmentModel(
        supabaseEstablishment.id,
        supabaseEstablishment.name,
        supabaseEstablishment.email_prefix,
        supabaseEstablishment.creator_id,
        fromStringToLocalDate(supabaseEstablishment.created_at),
        fromStringToLocalDate(supabaseEstablishment.updated_at),
        supabaseEstablishment.address,
        supabaseEstablishment.phone,
    );
    if (supabaseEstablishment.stripe_subscription_id !== null) {
        const subscriptionStatus = supabaseEstablishment
            .subscription_status as SubscriptionStatus;
        const subscription = new SubscriptionModel(
            supabaseEstablishment.id,
            SubscriptionProvider.STRIPE,
            supabaseEstablishment.stripe_subscription_id,
            supabaseEstablishment.stripe_customer_id!,
            subscriptionStatus,
            fromStringToLocalDate(supabaseEstablishment.subscription_start!),
            fromStringToLocalDate(supabaseEstablishment.subscription_end!),
        );
        newEstablishment.setSubscription(subscription);
    }

    return newEstablishment;
};

export const establishmentShortMapper = (
    id: string,
    name: string,
): EstablishmentShortModel => ({
    id,
    name,
});

export const establishmentInsertMapperToDatabase = (
    establishment: EstablishmentModelInsert,
): EstablishmentInsert => ({
    name: establishment.name,
    email_prefix: establishment.emailPrefix,
    creator_id: establishment.creatorId,
    address: establishment.address,
    phone: establishment.phone,
});
