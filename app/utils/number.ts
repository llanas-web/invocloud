// utils/number.ts
export function parseAmountFR(input: string | number): number {
    if (typeof input === "number") return input;
    let s = input.replace(/[€\s\u00A0\u202F']/g, "").trim();
    if (s.includes(",") && s.includes(".")) {
        s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.includes(",")) s = s.replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}

export function formatAmountLocale(
    value: number,
    locale = "fr-FR",
    fractionDigits = 2,
): string {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
