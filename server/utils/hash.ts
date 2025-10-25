import { createHash } from "crypto";

export function hashCode(code: string) {
    return createHash("sha256").update(code).digest("hex");
}
