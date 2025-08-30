import { createHash } from "crypto";

export function generateCode(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}

export function hashCode(code: string) {
    return createHash("sha256").update(code).digest("hex");
}
