import type { PostgrestError } from "@supabase/supabase-js";

export const handleSupabaseError = (
    message: string,
    error: PostgrestError,
): string => {
    console.error(message, error);
    return "An error occurred while processing your request.";
};
