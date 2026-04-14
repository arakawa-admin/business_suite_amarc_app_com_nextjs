export function getByPath(obj: unknown, path: string): unknown {
    if (obj == null) return undefined;
    const keys = path.split(".");
    let cur: any = obj;

    for (const k of keys) {
        if (cur == null) return undefined;
        const isIndex = /^[0-9]+$/.test(k);
        cur = isIndex ? cur[Number(k)] : cur[k];
    }
    return cur;
}

export function normalizeForCompare(v: unknown): unknown {
    if (v === "") return undefined;

    if (Array.isArray(v)) return v.map(normalizeForCompare);
    if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(o))
            out[key] = normalizeForCompare(o[key]);
        return out;
    }
    return v;
}

export function isEqualNormalized(a: unknown, b: unknown): boolean {
    const na = normalizeForCompare(a);
    const nb = normalizeForCompare(b);

    if (na === nb) return true;

    if (Array.isArray(na) && Array.isArray(nb)) {
        if (na.length !== nb.length) return false;
        return na.every((x, i) => isEqualNormalized(x, nb[i]));
    }

    if (na && nb && typeof na === "object" && typeof nb === "object") {
        const ao = na as Record<string, unknown>;
        const bo = nb as Record<string, unknown>;
        const aKeys = Object.keys(ao).sort();
        const bKeys = Object.keys(bo).sort();
        if (aKeys.length !== bKeys.length) return false;
        for (let i = 0; i < aKeys.length; i++)
            if (aKeys[i] !== bKeys[i]) return false;
        return aKeys.every((k) => isEqualNormalized(ao[k], bo[k]));
    }

    return false;
}

export type PickedRevision<R> = { revision: R; value: unknown };

export function pickChangedRevisionsForField<R extends { payload: unknown }>(
    revisionsAsc: R[],
    path: string,
    includeFirst = true,
): PickedRevision<R>[] {
    if (!revisionsAsc.length) return [];
    const picked: PickedRevision<R>[] = [];
    let last: unknown = undefined;

    for (let i = 0; i < revisionsAsc.length; i++) {
        const rev = revisionsAsc[i];
        const value = getByPath(rev.payload, path);

        if (i === 0) {
            if (includeFirst) picked.push({ revision: rev, value });
            last = value;
            continue;
        }

        if (!isEqualNormalized(value, last)) {
            picked.push({ revision: rev, value });
            last = value;
        }
    }
    return picked;
}
