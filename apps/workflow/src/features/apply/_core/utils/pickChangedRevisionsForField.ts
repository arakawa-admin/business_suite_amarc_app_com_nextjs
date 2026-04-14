const getValueByPath = (obj: any, path: string) =>
    path
        .split(".")
        .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

// 深い比較（payloadが配列/オブジェクトでもOK）
const deepEqual = (a: any, b: any) => {
    if (Object.is(a, b)) return true;
    // Date文字列などはここで吸収したければ追加
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
};


type NormalizedRevision = {
    id: string;
    revision_no: number;
    submitted_at?: string;
    payload: any;
};

// フィールド値が変わった revision のみを抜き出す（最初は任意で含める）
export const pickChangedRevisionsForField = (
    revisions: NormalizedRevision[],
    fieldPath: string,
    includeFirst = true,
) => {
    const sorted = [...revisions].sort((a, b) => a.revision_no - b.revision_no);

    let prevVal: any = undefined;
    const picked: { rev: NormalizedRevision; value: any }[] = [];

    sorted.forEach((rev, idx) => {
        const val = getValueByPath(rev.payload, fieldPath);

        if (idx === 0) {
            prevVal = val;
            if (includeFirst) picked.push({ rev, value: val });
            return;
        }

        if (!deepEqual(val, prevVal)) {
            picked.push({ rev, value: val });
            prevVal = val;
        }
    });

    // includeFirst=false で最初が同じ→変更だけ欲しいケース対応（OK）
    // includeFirst=true の場合でも、変更が一度も無ければ picked は [rev1] だけになる

    return picked;
};
