import { AttachmentCreateInput } from '@/schemas/approval/attachmentSchema';

type Presigned = {
    url: string;
    bucket: string;
    storage_key: string;
    attachment_id: string;
    content_type: string;
};

async function presignR2Upload(args: {
    path: string;
    filename: string;
    contentType: string;
}): Promise<Presigned> {
    const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            path: args.path,
            filename: args.filename,
            contentType: args.contentType,
        }),
    });
    if (!res.ok) throw new Error(`presign failed: ${args.filename}`);
    return res.json();
}

async function putToPresignedUrl(args: {
    presigned: Presigned;
    file: File;
}): Promise<void> {
    const res = await fetch(args.presigned.url, {
        method: "PUT",
        headers: { "Content-Type": args.presigned.content_type },
        body: args.file,
    });
    if (!res.ok)
        throw new Error(`upload failed: ${args.presigned.storage_key}`);
}

/**
 * R2へアップロードして、DB保存用のメタを返す（sha256は本物）
 */
async function uploadOneToR2(args: {
    path: string;
    file: File;
    filenameOverride?: string;
    contentTypeOverride?: string;
}) {
    const filename = args.filenameOverride ?? args.file.name;
    const contentType =
        args.contentTypeOverride ??
        args.file.type ??
        "application/octet-stream";

    const presigned = await presignR2Upload({
        path: args.path,
        filename,
        contentType,
    });

    await putToPresignedUrl({ presigned, file: args.file });

    const sha256 = await sha256Hex(args.file);

    return {
        sha256,
        bucket: presigned.bucket,
        storage_key: presigned.storage_key,
        content_type: presigned.content_type,
        byte_size: args.file.size,
        filename,
        // attachment_id: presigned.attachment_id, // 将来DBのidと揃えるなら使う
    };
}

export async function uploadFiles(data: {
    post_files:
        | {
            file: File;
            thumbnail: File;
            name: string;
            type: "pdf" | "image";
        }[]
        | undefined;
    author_id: string;
    path: string;
}) {
    if (!data.author_id)
        throw new Error("failed to upload: author_id is empty");

    const uploadedFiles: AttachmentCreateInput[] = [];
    const path = data.path;

    try {
        for (const item of data.post_files ?? []) {
            // 本体
            const main = await uploadOneToR2({
                path,
                file: item.file,
            });

            // サムネ（拡張子/Content-Typeは固定がおすすめ）
            const thumb = await uploadOneToR2({
                path,
                file: item.thumbnail,
                filenameOverride: "thumb.png",
                contentTypeOverride: item.thumbnail.type || "image/png",
            });

            uploadedFiles.push({
                sha256: main.sha256,
                bucket: main.bucket,
                filename: item.file.name,
                storage_key: main.storage_key,
                content_type: main.content_type,
                byte_size: main.byte_size,
                uploaded_by: data.author_id,
                uploaded_at: new Date(),

                // サムネも同一レコードに保持
                thumbnail_key: thumb.storage_key,
                thumbnail_type: thumb.content_type,
                thumbnail_size: thumb.byte_size,
            });
        }
    } catch (error) {
        console.error("uploadFiles", error);
        throw error;
    }

    return uploadedFiles;
}


async function sha256Hex(file: File) {
    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
