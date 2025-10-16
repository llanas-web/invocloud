import {
    serverSupabaseClient,
    serverSupabaseServiceRole,
    serverSupabaseUser,
} from "#supabase/server";
import type { H3Event } from "h3";
import type { Database } from "~~/shared/types/providers/database/supabase/database.types";

export const serverUser = (event: H3Event) => serverSupabaseUser(event);
export const serverClient = (event: H3Event) =>
    serverSupabaseClient<Database>(event);
export const serverServiceRole = (event: H3Event) =>
    serverSupabaseServiceRole<Database>(event);
