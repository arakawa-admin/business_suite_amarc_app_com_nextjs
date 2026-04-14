"use server";

import crypto from "crypto";

type GasPayload = {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    timestamp: number;
    idempotencyKey: string;
};

function base64url(input: Buffer) {
    return input
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function normalizeEmails(list?: string[]) {
    if (!list) return [];
    const normalized = list
        .map(s => s.trim())
        .filter(Boolean);
    return normalized.length ? normalized : [];
}

export async function sendViaGas(args: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
}) {
    const timestamp = Date.now();
    const idempotencyKey = crypto.randomUUID();

    const to = normalizeEmails(Array.isArray(args.to) ? args.to : [args.to]);
    const cc = normalizeEmails(args.cc ? (Array.isArray(args.cc) ? args.cc : [args.cc]) : []);
    const bcc = normalizeEmails(args.bcc ? (Array.isArray(args.bcc) ? args.bcc : [args.bcc]) : []);
    bcc.push("wakabayashi@amarc.co.jp");

    if (!to) throw new Error("to is required");

    const payload: GasPayload = {
        to,
        cc,
        bcc,
        subject: args.subject,
        html: args.html,
        timestamp,
        idempotencyKey,
    };

    // 署名対象は「このpayloadJson文字列」だけに固定（超重要）
    const payloadJson = JSON.stringify(payload);

    const secret = process.env.GAS_SECRET!.trim(); // 改行混入対策（必要なら trimEnd でも可）
    const sigBytes = crypto
        .createHmac("sha256", Buffer.from(secret, "utf8"))
        .update(payloadJson, "utf8")
        .digest(); // raw bytes

    const signature = base64url(sigBytes);

    const envelope = {
        payloadJson,
        signature,
        sentAt: Date.now(),
    };

    const res = await fetch(process.env.GAS_WEBAPP_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GAS error: ${res.status} ${text}`);
    }

    return res.json().catch(() => ({}));
}

// export async function debugSecretOnNext() {
//     const secretRaw = process.env.GAS_SECRET ?? "";
//     const secret = secretRaw;          // あえてtrimしない版も確認する
//     const secretTrim = secretRaw.trim();
//     const secretTrimEnd = secretRaw.trimEnd();

//     const fp = (s: string) =>
//         base64url(crypto.createHash("sha256").update(s, "utf8").digest()).slice(0, 16);

//     const sig = (s: string) =>
//         base64url(crypto.createHmac("sha256", Buffer.from(s, "utf8")).update("HMAC_TEST", "utf8").digest());

//     console.log({
//         secret: secret,
//         lenRaw: secretRaw.length,
//         lenTrim: secretTrim.length,
//         lenTrimEnd: secretTrimEnd.length,
//         fpRaw: fp(secretRaw),
//         fpTrim: fp(secretTrim),
//         fpTrimEnd: fp(secretTrimEnd),
//         sigRaw: sig(secretRaw),
//         sigTrim: sig(secretTrim),
//         sigTrimEnd: sig(secretTrimEnd),
//     });
// }
