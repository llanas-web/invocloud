import { fromDate } from "~/utils/date";
import type { EstablishmentDetailsDTO } from "~~/shared/application/establishment/dto";
import { SubscriptionStatus } from "~~/shared/domain/establishment/subscription.entity";

export class EstablishmentViewModel {
    constructor(
        private establishment: EstablishmentDetailsDTO,
    ) {}

    get name() {
        return this.establishment.name;
    }
    get address() {
        return this.establishment.address;
    }
    get phone() {
        return this.establishment.phone;
    }
    get emailPrefix() {
        return this.establishment.emailPrefix;
    }
    get creatorId() {
        return this.establishment.creatorId;
    }
    get subscription() {
        return this.establishment.subscription;
    }
    get members() {
        return this.establishment.members;
    }

    get hasSubscription() {
        return this.subscription !== null;
    }

    get isActive() {
        return this.hasSubscription &&
            this.subscription!.status === SubscriptionStatus.ACTIVE;
    }

    get isTrial() {
        return this.hasSubscription &&
            this.subscription!.status === SubscriptionStatus.TRIAL;
    }

    get dateEndLabel() {
        return this.subscription?.endAt
            ? fromDate(this.subscription.endAt)
            : "";
    }
}
