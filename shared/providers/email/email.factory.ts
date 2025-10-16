import EmailError from "./email.error";
import type { EmailProviderInterface } from "./email.interface";
import type { EmailProviderName } from "~~/shared/types/providers/email/types";
import { ResendRepository } from "./resend/resend.repository";

class EmailFactory {
    private static instance: EmailProviderInterface;

    private constructor(providerName: EmailProviderName) {
        EmailFactory.instance = this.createProvider(providerName);
    }

    private createProvider(name: EmailProviderName): EmailProviderInterface {
        switch (name) {
            case "resend":
                return new ResendRepository();
            case "postmark":
                throw new EmailError("Postmark provider not implemented yet");
            default:
                throw new EmailError(`Unknown email provider: ${name}`);
        }
    }

    public static getInstance(
        providerName: EmailProviderName,
    ): EmailProviderInterface {
        if (!EmailFactory.instance) {
            new EmailFactory(providerName);
        }
        return EmailFactory.instance;
    }
}

export default EmailFactory;
