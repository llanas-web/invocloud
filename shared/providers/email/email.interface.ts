import type { EmailSendOptions } from "~~/shared/types/providers/email/types";

export interface EmailProviderInterface {
    sendEmail(options: EmailSendOptions): Promise<void>;
}
