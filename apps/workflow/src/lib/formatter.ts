// 日本版 電話番号を表示する際のフォーマット
export function formatJpPhoneAsYouType(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return "";

    // 携帯 (070/080/090) 11桁: 090-1234-5678
    if (/^0[789]0/.test(digits)) {
        const a = digits.slice(0, 3);
        const b = digits.slice(3, 7);
        const c = digits.slice(7, 11);
        return [a, b, c].filter(Boolean).join("-");
    }

    // フリーダイヤル/ナビダイヤル等 10桁: 0120-123-456 / 0800-123-456
    if (/^0(120|800|570)/.test(digits)) {
        const a = digits.slice(0, 4);
        const b = digits.slice(4, 7);
        const c = digits.slice(7, 10);
        return [a, b, c].filter(Boolean).join("-");
    }

    // 東京/大阪 (03/06) 10桁: 03-1234-5678
    if (/^0[36]/.test(digits)) {
        const a = digits.slice(0, 2);
        const b = digits.slice(2, 6);
        const c = digits.slice(6, 10);
        return [a, b, c].filter(Boolean).join("-");
    }

    // その他（ざっくり）：10桁は 0xxx-xx-xxxx or 0xxxx-x-xxxx などがあるので
    // ここは簡易に「0xxx-xxx-xxxx」寄せ（厳密にやるならlibphonenumber推奨）
    if (digits.length <= 10) {
        const a = digits.slice(0, 3);
        const b = digits.slice(3, 6);
        const c = digits.slice(6, 10);
        return [a, b, c].filter(Boolean).join("-");
    }

    // 11桁（その他想定）：0xxxx-xxx-xxxx 的に割る
    const a = digits.slice(0, 4);
    const b = digits.slice(4, 7);
    const c = digits.slice(7, 11);
    return [a, b, c].filter(Boolean).join("-");
}

export function formatZipCode(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 9);
    return [a, b].filter(Boolean).join("-");
}
