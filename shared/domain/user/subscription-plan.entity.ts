export type SubscriptionPlanEntityProps = {
    name: "starter" | "pro";
    createdAt: Date;
    providerProductId: string;
    providerPriceId: string;
    includedInvoices: number;
    maxEstablishments: number;
    maxMembersPerEstablishment: number;
};

class SubscriptionPlan {
    constructor(readonly props: SubscriptionPlanEntityProps) {}

    get name() {
        return this.props.name;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get providerProductId() {
        return this.props.providerProductId;
    }
    get providerPriceId() {
        return this.props.providerPriceId;
    }
    get includedInvoices() {
        return this.props.includedInvoices;
    }
    get maxEstablishments() {
        return this.props.maxEstablishments;
    }
    get maxMembersPerEstablishment() {
        return this.props.maxMembersPerEstablishment;
    }
}

export default SubscriptionPlan;
