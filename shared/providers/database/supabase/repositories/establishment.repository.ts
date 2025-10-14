import type { Database } from "~~/types/providers/database/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EstablishmentRepository } from "../../database.interface";
import {
    establishmentInsertMapperToDatabase,
    establishmentMapperFromDatabase,
    establishmentShortMapper,
} from "../mapper";
import { memberMapperFromDatabase } from "../mapper/member.mapper";
import { userMapperFromDatabase } from "../mapper/user.mapper";
import type {
    EstablishmentModelInsert,
    EstablishmentModelUpdate,
} from "~~/shared/models/establishment.model";
import { Err, Ok } from "../../result";
import { DomainError } from "~~/shared/errors/domain.error";
import { SupabaseError } from "../supabase-error";

export class EstablishmentSupabaseRepository
    implements EstablishmentRepository {
    constructor(private supabase: SupabaseClient<Database>) {}

    getAllEstablishments = async (
        filters: {
            ids?: string[];
            prefixEmails?: string[];
        },
    ) => {
        const request = this.supabase
            .from("establishments")
            .select("*");

        if (filters.ids) request.in("id", filters.ids);
        if (filters.prefixEmails) {
            request.in("email_prefix", filters.prefixEmails);
        }

        const { data, error } = await request;
        if (error) return Err(SupabaseError.fromPostgrest(error));
        else if (!data?.length) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    {
                        filters,
                    },
                ),
            );
        }
        return Ok(
            data.map((establishment) =>
                establishmentMapperFromDatabase(establishment)
            ),
        );
    };

    getEstablishmentsShortFromUploadId = async (
        uploadId: string,
        userId: string,
    ) => {
        const { data, error } = await this.supabase
            .from("upload_validations")
            .select("establishments(id, name)")
            .eq("upload_id", uploadId)
            .eq("uploader_id", userId);

        if (error) return Err(SupabaseError.fromPostgrest(error));
        else if (!data?.length) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    { uploadId, userId },
                ),
            );
        }

        return Ok(
            data.filter((data) => data.establishments != null).map((
                { establishments },
            ) => establishmentShortMapper(
                establishments!.id,
                establishments!.name,
            )),
        );
    };

    getEstablishmentsFromMemberId = async (
        userId: string,
    ) => {
        const { data, error } = await this.supabase
            .from("establishment_members")
            .select("establishments(*)")
            .or(`user_id.eq.${userId}`);
        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data?.length) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    { userId },
                ),
            );
        }
        return Ok(
            data.filter((establishments) =>
                establishments.establishments != null
            )
                .map((em) =>
                    establishmentMapperFromDatabase(em.establishments!)
                ),
        );
    };

    getEstablishmentMembers = async (establishmentId: string) => {
        const { data, error } = await this.supabase
            .from("establishment_members")
            .select("*, user:users(*)")
            .eq("establishment_id", establishmentId);
        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data?.length) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    { establishmentId },
                ),
            );
        }
        return Ok(
            data.map((member) => {
                const userModel = userMapperFromDatabase(member.user);
                return memberMapperFromDatabase(member, userModel);
            }),
        );
    };

    addEstablishmentMember = async (
        establishmentId: string,
        userId: string,
    ) => {
        const { data, error } = await this.supabase
            .from("establishment_members")
            .insert({
                establishment_id: establishmentId,
                user_id: userId,
            })
            .select("*, user:users(*)")
            .single();
        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data) {
            return Err(
                new DomainError(
                    "NO_MEMBER",
                    "Membre non trouvé après insertion",
                    { establishmentId, userId },
                ),
            );
        }

        const userModel = userMapperFromDatabase(data.user);
        return Ok(memberMapperFromDatabase(data, userModel));
    };

    removeEstablishmentMember = async (
        establishmentId: string,
        userId: string,
    ) => {
        const { error } = await this.supabase
            .from("establishment_members")
            .delete()
            .eq("establishment_id", establishmentId)
            .eq("user_id", userId);

        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(true);
    };

    createEstablishment = async (
        establishement: EstablishmentModelInsert,
    ) => {
        const establishmentToInsert = establishmentInsertMapperToDatabase(
            establishement,
        );
        const { data, error } = await this.supabase.from("establishments")
            .insert(establishmentToInsert).select().single();

        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Établissement non trouvé après insertion",
                    { establishmentToInsert },
                ),
            );
        }
        return Ok(establishmentMapperFromDatabase(data));
    };

    isEmailPrefixAvailable = async (
        emailPrefix: string,
        excludeEstablishmentId?: string,
    ) => {
        const request = this.supabase
            .from("establishments")
            .select("id")
            .eq("email_prefix", emailPrefix);

        if (excludeEstablishmentId) {
            request.neq("id", excludeEstablishmentId);
        }
        request.maybeSingle();
        const { data, error } = await request;
        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    { emailPrefix },
                ),
            );
        }
        return Ok(true);
    };

    getEstablishmentsShortFromEmails = async (
        senderEmail: string,
        recipientEmail: string,
    ) => {
        const { data, error } = await this.supabase
            .from("suppliers")
            .select(`
                establishments!inner(
                    id,
                    name,
                    establishment_members!inner(
                        users!inner(email)
                    )
                )
            `)
            .eq(
                "establishments.establishment_members.users.email",
                recipientEmail,
            )
            .contains("emails", [senderEmail]);

        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data?.length) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Aucun établissement trouvé",
                    { senderEmail, recipientEmail },
                ),
            );
        }

        return Ok(
            data.map(({ establishments }) =>
                establishmentShortMapper(establishments.id, establishments.name)
            ),
        );
    };

    updateEstablishment = async (
        id: string,
        updates: EstablishmentModelUpdate,
    ) => {
        const { data, error } = await this.supabase
            .from("establishments")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) return Err(SupabaseError.fromPostgrest(error));
        if (!data) {
            return Err(
                new DomainError(
                    "NO_ESTABLISHMENT",
                    "Établissement non trouvé après mise à jour",
                    { id, updates },
                ),
            );
        }
        return Ok(establishmentMapperFromDatabase(data));
    };

    deleteEstablishment = async (id: string) => {
        const { error } = await this.supabase
            .from("establishments")
            .delete()
            .eq("id", id);
        if (error) return Err(SupabaseError.fromPostgrest(error));
        return Ok(true);
    };
}
