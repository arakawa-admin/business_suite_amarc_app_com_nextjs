function debugSecretOnGas_(requestId) {
  const secretRaw = PropertiesService.getScriptProperties().getProperty("GAS_HMAC_SECRET") || "";
  const secretTrim = secretRaw.trim();
  const secretTrimEnd = secretRaw.trimEnd();

  const fp = (s) => sha256Base64Url_(s).slice(0, 16);
  const sig = (s) => hmacSha256Base64Url_("HMAC_TEST", s);

  const info = {
    lenRaw: secretRaw.length,
    lenTrim: secretTrim.length,
    lenTrimEnd: secretTrimEnd.length,
    fpRaw: fp(secretRaw),
    fpTrim: fp(secretTrim),
    fpTrimEnd: fp(secretTrimEnd),
    sigRaw: sig(secretRaw),
    sigTrim: sig(secretTrim),
    sigTrimEnd: sig(secretTrimEnd),
  };

  // シートには JSON 文字列で入れる（オブジェクトのまま渡さない）
  logSend_([new Date(), "", "", "INFO", "debugSecretOnGas_ " + JSON.stringify(info), requestId, ""]);
}

function doPost(e) {
  const requestId = Utilities.getUuid();

  try {
    // logSend_([new Date(), "", "", "INFO", "before debugSecretOnGas_ ", requestId, ""]);

    // debugSecretOnGas_(requestId); // tryの中で呼ぶ

    if (!e || !e.postData || !e.postData.contents) {
      logSend_([new Date(), "", "", "NG", "Missing body", requestId, ""]);
      return json_({ ok: false, error: "Missing body", requestId });
    }

    // 1) envelope を読む（Nextが送っているのはこれ）
    const envelope = JSON.parse(e.postData.contents);
    const payloadJson = String(envelope.payloadJson || "");
    const gotSig = String(envelope.signature || "");

    if (!payloadJson || !gotSig) {
      logSend_([new Date(), "", "", "NG", "Missing payloadJson/signature", requestId, ""]);
      return json_({ ok: false, error: "Missing payloadJson/signature", requestId });
    }

    // 2) 署名検証（payloadJson 文字列をそのまま HMAC）
    const secret = getSecret_().trimEnd();
    const expected = hmacSha256Base64Url_(payloadJson, secret);

    const payloadHash = sha256Base64Url_(payloadJson);

    // const payloadHashForLog = sha256Base64Url_(payloadJson);
    // logSend_([new Date(), "", "", "INFO", "payloadHash(from payloadJson)", requestId, payloadHashForLog]);

    if (!timingSafeEqual_(expected, gotSig)) {
      logSend_([new Date(), "", "", "NG", "Invalid signature", requestId, payloadHash]);
      return json_({ ok: false, error: "Invalid signature", requestId });
    }

    // 3) OKなら payload を parse（ここで初めて中身を見る）
    const payload = JSON.parse(payloadJson);

    const toList = normalizeEmailList_(payload.to);
    const ccList = normalizeEmailList_(payload.cc);
    const bccList = normalizeEmailList_(payload.bcc);

    const subject = String(payload.subject || "");
    const html = String(payload.html || "");
    const timestamp = Number(payload.timestamp);
    const idempotencyKey = String(payload.idempotencyKey || "");

    // 必須チェック
    if (!toList.length || !subject || !html || !timestamp || !idempotencyKey) {
      logSend_([new Date(), join_(toList), subject, "NG", "Missing fields", requestId, payloadHash]);
      return json_({ ok: false, error: "Missing fields", requestId });
    }

    // 宛先制限（許可リスト）
    const allRcpt = [].concat(toList, ccList, bccList);
    if (!areAllAllowed_(allRcpt)) {
      logSend_([new Date(), join_(toList), subject, "NG", "Recipient not allowed", requestId, payloadHash]);
      return json_({ ok: false, error: "Recipient not allowed", requestId });
    }

    // timestampチェック（リプレイ防止）
    const allowedDriftMs = 5 * 60 * 1000;
    if (Math.abs(Date.now() - timestamp) > allowedDriftMs) {
      logSend_([new Date(), join_(toList), subject, "NG", "Timestamp expired", requestId, payloadHash]);
      return json_({ ok: false, error: "Timestamp expired", requestId });
    }
    
    // 重複防止（同じidempotencyKeyは1回のみ）
    ensureNotDuplicate_(idempotencyKey);

    // レート制限（誤爆防止）
    rateLimitOrThrow_();

  	// logSend_([new Date(), to, subject, "INFO", "before sendEmail", requestId, payloadHash]);

    // 送信（textはNextから来てないので、ここではstripでplainを作る）
    const mailOpts = {
      htmlBody: html,
      name: "問合せ管理システム通知専用",
    };
    if (ccList.length) mailOpts.cc = join_(ccList);
    if (bccList.length) mailOpts.bcc = join_(bccList);

    GmailApp.sendEmail(join_(toList), subject, stripHtml_(html), mailOpts);

    logSend_([new Date(), join_(toList), subject, "OK", "", requestId, payloadHash]);
    return json_({ ok: true, requestId });

	  // logSend_([new Date(), to, subject, "INFO", "after sendEmail", requestId, payloadHash]);

    return json_({ ok: true, requestId });
  } catch (err) {
    logSend_([new Date(), "", "", "NG", String(err), requestId, ""]);
    return json_({ ok: false, error: String(err), requestId });
  }
}

// ===== 設定 =====

function getSecret_() {
  const secret = PropertiesService.getScriptProperties().getProperty("GAS_HMAC_SECRET");
  if (!secret) throw new Error("Missing script property: GAS_HMAC_SECRET");
  return secret;
}

function getAllowedTo_() {
  const raw = PropertiesService.getScriptProperties().getProperty("ALLOWED_TO") || "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function isAllowedTo_(to) {
  return getAllowedTo_().includes(to);
}

function getMaxPerMin_() {
  const raw = PropertiesService.getScriptProperties().getProperty("MAX_PER_MIN");
  const n = Number(raw || "5");
  return Number.isFinite(n) && n > 0 ? n : 5;
}

// ===== 署名・ハッシュ（base64urlで統一）=====

function utf8Bytes_(s) {
  // 明示的に UTF-8 bytes にする
  return Utilities.newBlob(String(s), "text/plain", "x").getBytes();
}

function base64urlFromBytes_(bytes) {
  const b64 = Utilities.base64Encode(bytes);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hmacSha256Base64Url_(message, secret) {
  const msgBytes = utf8Bytes_(message);
  const keyBytes = utf8Bytes_(secret); // keyもbytesにしておくとズレにくい
  const raw = Utilities.computeHmacSha256Signature(msgBytes, keyBytes);
  return base64urlFromBytes_(raw);
}

function sha256Base64Url_(message) {
  const msgBytes = utf8Bytes_(message);
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, msgBytes);
  return base64urlFromBytes_(bytes);
}

function timingSafeEqual_(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function stripHtml_(html) {
  return String(html || "").replace(/<[^>]*>/g, "");
}

// ===== 重複防止 =====

function ensureNotDuplicate_(key) {
  const lock = LockService.getScriptLock();
  lock.waitLock(3000);

  try {
    const cache = CacheService.getScriptCache();
    const k = `idem_${key}`;

    if (cache.get(k)) {
      throw new Error("Duplicate request");
    }

    // 5分 = 300秒
    cache.put(k, "1", 300);
  } finally {
    lock.releaseLock();
  }
}

// ===== レート制限 =====

function rateLimitOrThrow_() {
  const MAX_PER_MIN = getMaxPerMin_();
  const lock = LockService.getScriptLock();
  lock.waitLock(3000);

  try {
    const cache = CacheService.getScriptCache();
    const bucket = Math.floor(Date.now() / 60000);
    const key = `rate_${bucket}`;

    const current = Number(cache.get(key) || "0");
    if (current >= MAX_PER_MIN) {
      throw new Error("Rate limit exceeded");
    }

    // 1分バケットが途中で消えないように2分TTL
    cache.put(key, String(current + 1), 120);
  } finally {
    lock.releaseLock();
  }
}


// ===== ログ / 応答 =====

function logSend_(row) {
  const sheetId = PropertiesService.getScriptProperties().getProperty("LOG_SHEET_ID");
  if (!sheetId) return;

  const ss = SpreadsheetApp.openById(sheetId);
  const sheetName = "_log";
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["time", "to", "subject", "status", "error", "requestId", "payloadHash"]);
  }
  sheet.appendRow(row);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== normalize / allowlist ヘルパー =====

function normalizeEmailList_(v) {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map(x => String(x || "").trim())
    .filter(Boolean);
}

function join_(list) {
  return (list || []).join(",");
}

function areAllAllowed_(emails) {
  const allowed = getAllowedTo_(); // 既存: ALLOWED_TO を配列化
  // 完全一致で管理（安全）。必要ならドメイン許可などに拡張可
  return emails.every(e => allowed.includes(e));
}
