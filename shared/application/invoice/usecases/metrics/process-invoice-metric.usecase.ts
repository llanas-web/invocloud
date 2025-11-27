import type { Repositories } from "~~/shared/domain/common/repositories.factory";
import type { Queries } from "~~/shared/domain/common/queries.factory";
import type { PaymentRepository } from "~~/shared/application/common/providers/payment/payment.repository";

export default class ProcessInvoiceMetricUsecase {
    constructor(
        private repos: Repositories,
        private queries: Queries,
        private paymentRepository: PaymentRepository,
    ) {}

    async execute() {
        const invoices = await this.queries.invoiceQuery
            .listUnmeasuredInvoices();

        // grouper les invoices par establishmentId
        const invoicesByEstablishment = invoices.reduce<
            Map<string, number>
        >((map, invoice) => {
            const estId = invoice.establishmentId;
            if (map.has(estId)) {
                const newNumber = map.get(estId)! + 1;
                map.set(estId, newNumber);
            } else {
                map.set(estId, 1);
            }
            return map;
        }, new Map<string, number>());

        const listUserDetailsByEstablishment = await this.queries.userQuery
            .getUsersDetailsByEstablishmentsIds(
                Array.from(invoicesByEstablishment.keys()),
            );

        const invoicesToMeasureByCustomerId = listUserDetailsByEstablishment
            .reduce<
                Map<string, number>
            >((map, { establishmentId, userDetails }) => {
                const customerId = userDetails.subscription?.customerId;
                if (!customerId) return map;
                const invoiceCount =
                    invoicesByEstablishment.get(establishmentId) ?? 0;
                const newNumber = map.get(customerId) ?? 0;
                map.set(customerId, newNumber + invoiceCount);
                return map;
            }, new Map<string, number>());

        await Promise.all(
            Array.from(invoicesToMeasureByCustomerId.entries())
                .map(([customerId, metricValue]) =>
                    this.paymentRepository.updateInvoiceUsageMetric(
                        customerId,
                        metricValue,
                    ).then(() =>
                        console.log(
                            `Updated metric for customer ${customerId} with value ${metricValue}`,
                        )
                    )
                        .catch((error) =>
                            console.error(
                                `Failed to update metric for customer ${customerId}:`,
                                error,
                            )
                        )
                ),
        );

        await this.queries.invoiceQuery.markInvoicesAsMeasured(
            invoices.map((inv) => inv.id),
        );
    }
}
