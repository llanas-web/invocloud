import type { EmailSendOptions } from "~~/shared/types/providers/email/types";
import EmailError from "../email.error";
import type { EmailProviderInterface } from "../email.interface";

export class ResendRepository implements EmailProviderInterface {
    private RESEND_API_KEY = process.env.RESEND_API_KEY;
    private resendInstance = useResend();

    private checkConfig() {
        if (!this.RESEND_API_KEY) {
            throw new EmailError("Resend API key is not configured.");
        }
    }

    async sendEmail({
        to,
        subject,
        html,
    }: EmailSendOptions) {
        this.checkConfig();
        try {
            await this.resendInstance.emails.send({
                from: `InvoCloud <${process.env.RESEND_EMAIL_FROM}>`,
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
