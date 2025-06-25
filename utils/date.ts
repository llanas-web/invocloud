export function fromUnix(timestamp?: number | null): string | null {
    return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

export function nowISO(): string {
    return new Date().toISOString();
}
