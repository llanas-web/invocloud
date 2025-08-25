import { CalendarDate } from "@internationalized/date";

export function fromUnix(timestamp?: number | null): string | null {
    return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

export function nowISO(): string {
    return new Date().toISOString();
}

export function toCalendarDate(date: Date) {
    return new CalendarDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
    );
}
