const sendEmail = async (to: string[], subject: string, html: string) => {
    const { emails } = useResend();
    try {
        await emails.send({
            from: `InvoCloud <${process.env.RESEND_EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }
};

export { sendEmail };
