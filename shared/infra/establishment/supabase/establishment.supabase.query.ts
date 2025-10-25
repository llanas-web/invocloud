import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../common/errors/supabase.error";
import type {
    EstablishmentDetailsDTO,
    EstablishmentListItemDTO,
    MemberDTO,
    SubscriptionDTO,
} from "~~/shared/application/establishment/dto";
import type { EstablishmentQuery } from "~~/shared/application/establishment/establishment.query";
import type { ListEstablishmentQueryFilter } from "~~/shared/application/establishment/queries";
import type { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";
import type { Database } from "../../common/supabase/database.types";

export class EstablishmentSupabaseQuery implements EstablishmentQuery {
    constructor(private readonly supabase: SupabaseClient<Database>) {}

    async listEstablishments(
        filter?: ListEstablishmentQueryFilter,
    ): Promise<EstablishmentListItemDTO[]> {
        const req = this.supabase
            .from("establishments")
            .select(
                "id, name, creator_id, created_at, email_prefix, updated_at",
            )
            .order("created_at", { ascending: false });

        if (filter?.memberIds && filter.memberIds.length > 0) {
            req.in("creator_id", filter.memberIds);
        }

        const { data, error } = await req;
        if (error) SupabaseError.fromPostgrest(error);
        return data!.map((row) => ({
            id: row.id,
            name: row.name,
            creatorId: row.creator_id,
            emailPrefix: row.email_prefix,
            updatedAt: fromStringToLocalDate(row.updated_at),
            createdAt: fromStringToLocalDate(row.created_at),
        }));
    }

    async isEmailPrefixAvailable(
        emailPrefix: string,
        excludeId?: string | null,
    ): Promise<boolean> {
        let req = this.supabase
            .from("establishments")
            .select("id")
            .eq("email_prefix", emailPrefix);
        if (excludeId) {
            req = req.neq("id", excludeId);
        }
        const { data, error } = await req;
        if (error) throw SupabaseError.fromPostgrest(error);
        return data!.length === 0;
    }

    async hasAnyByCreatorId(userId: string): Promise<boolean> {
        const { error, count } = await this.supabase
            .from("establishments")
            .select("id", { count: "exact", head: true })
            .eq("creator_id", userId);
        if (error) throw SupabaseError.fromPostgrest(error);
        return count != null && count > 0;
    }

    async getEstablishmentDetails(
        id: string,
    ): Promise<EstablishmentDetailsDTO | null> {
        const { data, error } = await this.supabase
            .from("establishments")
            .select(`*,
                subscription:subscriptions(*),
                establishment_members(
                    *,
                    users(*)
                )`)
            .eq("establishment_id", id)
            .single();
        if (error) throw SupabaseError.fromPostgrest(error);
        if (!data) return null;

        const subscription = data.subscription === null ? null : {
            status: data.subscription?.status as SubscriptionStatus,
            endAt: data.subscription?.end_at
                ? new Date(data.subscription.end_at)
                : null,
        } as SubscriptionDTO;

        const members = data.establishment_members.map((em) => ({
            id: em.user_id,
            role: em.role,
            email: em.users.email,
            fullName: em.users.full_name,
            status: em.status,
        } as MemberDTO));

        return {
            id: data.id,
            name: data.name,
            emailPrefix: data.email_prefix,
            address: data.address,
            phone: data.phone,
            creatorId: data.creator_id,
            members: members,
            subscription,
        };
    }

    async isSenderAuthorized(
        senderEmail: string,
        recipientEmail: string,
    ) {
        const { data, error } = await this.supabase.rpc(
            "check_sender_authorized",
            {
                sender_email: senderEmail,
                recipient_email: recipientEmail,
            },
        );
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.length !== 0;
    }

    async listEstablishmentBySupplierEmail(
        supplierEmail: string,
    ): Promise<EstablishmentListItemDTO[]> {
        const { data, error } = await this.supabase
            .from("suppliers")
            .select(`
                id, 
                emails, 
                establishment:establishments(
                    id,
                    name,
                    email_prefix,
                    creator_id,
                    created_at,
                    updated_at
                )`)
            .contains("emails", [supplierEmail]);
        if (error) throw SupabaseError.fromPostgrest(error);
        return data.map((row) => ({
            id: row.establishment.id,
            name: row.establishment.name,
            emailPrefix: row.establishment.email_prefix,
            creatorId: row.establishment.creator_id,
            createdAt: new Date(row.establishment.created_at),
            updatedAt: new Date(row.establishment.updated_at),
        }));
    }
}
