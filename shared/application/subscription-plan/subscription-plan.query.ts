import type { SubscriptionPlanDTO } from "./dto/subscription-plan.dto";

export interface SubscriptionPlanQuery {
    getSubscriptionPlanByName(
        planName: string,
    ): Promise<SubscriptionPlanDTO | null>;
    getById(id: string): Promise<SubscriptionPlanDTO | null>;
}
