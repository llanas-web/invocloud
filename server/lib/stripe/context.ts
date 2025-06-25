import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/types/database.types";

export interface StripeHandlerContext {
    stripe: Stripe;
    supabase: SupabaseClient<Database>;
}
