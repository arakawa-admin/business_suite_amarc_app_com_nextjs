export type FetchResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; code?: string };

export const ok = <T>(data: T): FetchResult<T> => ({ ok: true, data });
export const err = (error: string, code?: string): FetchResult<never> => ({ ok: false, error, code });
