import type {
    Establishment,
    EstablishmentInsert,
    User,
    UserUpdate,
} from "~~/types";
import type { Database } from "~~/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

const createEstablishmentRepository = (supabase: SupabaseClient<Database>) => {
    const getEstablishmentsByIds = async (
        ids: string[],
        single: boolean = false,
    ) => {
        const establishmentsResponse = await supabase
            .from("establishments")
            .select("*")
            .in("id", ids);
        if (establishmentsResponse.error) {
            console.error(
                "Error fetching establishments by IDs:",
                establishmentsResponse.error,
            );
        }
        return establishmentsResponse;
    };

    const getEstablishmentsFromMemberId = async (
        userId: string,
    ) => {
        const establishmentsResponse = await supabase
            .from("establishment_members")
            .select("*, establishments(*)")
            .or(`user_id.eq.${userId}`);
        if (establishmentsResponse.error) {
            console.error(
                "Error fetching establishments for user:",
                establishmentsResponse.error,
            );
        }
        return establishmentsResponse;
    };

    const getEstablishmentByPrefix = async (emailPrefix: string) => {
        const establishmentResponse = await supabase
            .from("establishments")
            .select("*")
            .eq("email_prefix", emailPrefix)
            .single();
        if (establishmentResponse.error) {
            console.error(
                "Error fetching establishment by email prefix:",
                establishmentResponse.error,
            );
        }
        return establishmentResponse;
    };

    const getEstablishmentsMembers = async (establishmentId: string) => {
        const membersResponse = await supabase
            .from("establishment_members")
            .select("*, users(*)")
            .eq("establishment_id", establishmentId);
        if (membersResponse.error) {
            console.error(
                "Error fetching members for establishment:",
                membersResponse.error,
            );
        }
        return membersResponse;
    };

    const addMemberToEstablishment = async (
        establishmentId: string,
        userId: string,
    ) => {
        const memberResponse = await supabase
            .from("establishment_members")
            .insert({
                establishment_id: establishmentId,
                user_id: userId,
            })
            .select()
            .single();
        if (memberResponse.error) {
            console.error(
                "Error adding member to establishment:",
                memberResponse.error,
            );
        }
        return memberResponse;
    };

    const createEstablishment = async (
        data: Omit<EstablishmentInsert, "email_prefix">,
    ) => {
        const emailPrefix = await supabase.rpc("make_email_prefix", {
            src: data.name,
        });
        if (emailPrefix.error) {
            console.error(
                "Error generating email prefix:",
                emailPrefix.error,
            );
            return { data: null, error: emailPrefix.error };
        }
        const createdEstablishment = await supabase.from("establishments")
            .insert({
                ...data,
                email_prefix: emailPrefix.data,
            }).select().single();
        if (createdEstablishment.error) {
            console.error(
                "Error creating establishment:",
                createdEstablishment.error,
            );
        }
        return createdEstablishment;
    };

    const isEmailPrefixAvailable = async (
        emailPrefix: string,
        excludeEstablishmentId?: string,
    ) => {
        const request = supabase
            .from("establishments")
            .select("id")
            .eq("email_prefix", emailPrefix);

        if (excludeEstablishmentId) {
            request.neq("id", excludeEstablishmentId);
        }
        request.maybeSingle();
        const { data, error } = await request;
        if (error) {
            console.error("Error checking email prefix availability:", error);
            return false;
        }
        return data === null;
    };

    const updateEstablishment = async (
        id: string,
        updates: Partial<Establishment>,
    ) => {
        const establishmentResponse = await supabase
            .from("establishments")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (establishmentResponse.error) {
            console.error(
                "Error updating establishment:",
                establishmentResponse.error,
            );
        }
        return establishmentResponse;
    };

    const deleteEstablishment = async (id: string) => {
        const establishmentResponse = await supabase
            .from("establishments")
            .delete()
            .eq("id", id);
        if (establishmentResponse.error) {
            console.error(
                "Error deleting establishment:",
                establishmentResponse.error,
            );
            return false;
        }
        return true;
    };

    return {
        getEstablishmentsByIds,
        getEstablishmentsFromMemberId,
        getEstablishmentsMembers,
        addMemberToEstablishment,
        getEstablishmentByPrefix,
        createEstablishment,
        isEmailPrefixAvailable,
        deleteEstablishment,
        updateEstablishment,
    };
};

export default createEstablishmentRepository;
