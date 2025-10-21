export const fmtCurrency = (
    amountCents?: number | null,
    currency = "EUR",
    locale = "fr-FR",
) => amountCents == null ? "—" : new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
})
    .format(amountCents / 100);

export const fmtDate = (d?: Date | null, locale = "fr-FR") =>
    d
        ? new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(d)
        : "—";

export const ago = (d?: Date | null) => {
    if (!d) return "—";
    const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
    const diffDays = Math.round(
        (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return rtf.format(diffDays, "day");
};
