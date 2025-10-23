import { CalendarDate } from "@internationalized/date";
import { format, isAfter, isBefore, isEqual, isSameDay } from "date-fns";

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

export function isDateInRange(
    date: Date,
    start: Date,
    end: Date,
): boolean {
    return isSameDay(date, start) || isSameDay(date, end) ||
        (isBefore(date, end) || isEqual(date, end)) &&
            (isAfter(date, start) || isEqual(date, start));
}

export function fromDate(date: Date | number | string) {
    return format(date, "dd/MM/yyyy");
}
