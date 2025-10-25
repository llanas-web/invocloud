import type { SendEmailDTO } from "./dto/send-email.dto";

export interface EmailRepository {
    sendEmail(options: SendEmailDTO): Promise<void>;
}
