export type SendEmailDTO = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    template?: string;
    variables?: Record<string, any>;
    from?: string;
};
