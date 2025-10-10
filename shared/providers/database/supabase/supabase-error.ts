import DatabaseError from "../database-error";
import type { AuthError, PostgrestError } from "@supabase/supabase-js";

class SupabaseError extends DatabaseError {
    constructor(message: string, error?: PostgrestError | AuthError) {
        super(message, error);
        this.name = "SupabaseError";
    }
}

export default SupabaseError;
