export function isPlural(
    length: number,
    onPlural = "",
    onSingular = "",
): string {
    return length > 1 ? onPlural : onSingular;
}

export function enumFromUnion<T extends string>(...values: T[]) {
    return values;
}
