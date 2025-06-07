export function isPlural(
    length: number,
    onPlural = "",
    onSingular = "",
): string {
    return length > 1 ? onPlural : onSingular;
}
