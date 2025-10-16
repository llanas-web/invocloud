export type EmailProviderName = "resend" | "postmark";

export type EmailSendOptions = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    template?: string; // nom du template à utiliser
    variables?: Record<string, any>; // variables à injecter dans le template
    from?: string;
};
