import type { SendEmailDTO } from "~~/shared/application/common/providers/email/dto/send-email.dto";
import EmailError from "~~/shared/application/common/providers/email/email.error";
import type { EmailRepository } from "~~/shared/application/common/providers/email/email.repository";

class EmailResendRepository implements EmailRepository {
    private resendInstance = useResend();
    private emailFrom: string;

    constructor() {
        const config = useRuntimeConfig();
        this.emailFrom = config.emailFrom as string;
    }

    async sendEmail({
        to,
        subject,
        html,
    }: SendEmailDTO) {
        try {
            await this.resendInstance.emails.send({
                from: `InvoCloud <${this.emailFrom}>`,
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error("❌ Failed to send email:", error);
            throw new EmailError("Failed to send email via Resend.");
        }
    }
}

export default EmailResendRepository;
