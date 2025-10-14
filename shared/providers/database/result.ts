export type Result<T, E = unknown> = { ok: true; value: T } | {
  ok: false;
  error: E;
};

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function unwrapOrThrow<T, E extends Error>(res: Result<T, E>): T {
  if (res.ok) return res.value;
  throw res.error;
}
