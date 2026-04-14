// "use server";

// import { supabaseAdmin } from "../admin";
// import { createClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/client";
// import { generateThumbnail } from "@/lib/file/imageUtils";

type Attachment = {
    file: File,
    thumbnail: File,
    name: string,
    type: "pdf" | "image",
}

const SUPABASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? process.env.SUPABASE_STORAGE_BUCKET;

export async function uploadToSupabase(
    attachment: Attachment,
    path: string,
    bucket = SUPABASE_STORAGE_BUCKET ?? "attachments"
) {
    const supabase = createClient();

    const ext = attachment.file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const fileKey = `${path}/main.${ext}`;
    const thumbnailKey = `${path}/thumb.png`;

    const { error: mainError } = await supabase.storage.from(bucket).upload(fileKey, attachment.file, {
        contentType: attachment.file.type,
        upsert: false,
    });
    if (mainError) throw new Error("failed to upload main: " + mainError.message);

    const { error: thumbError } = await supabase.storage.from(bucket).upload(thumbnailKey, attachment.thumbnail, {
        contentType: "image/png",
        upsert: false,
    });
    if (thumbError) throw new Error("failed to upload thumb: " + thumbError.message);

    return {
        bucket,
        original_name: attachment.file.name,
        file_key: fileKey,
        file_type: attachment.file.type,
        file_size: attachment.file.size,
        thumbnail_key: thumbnailKey,
        thumbnail_type: "image/png",
        thumbnail_size: attachment.thumbnail.size,
    };
    // const supabase = await createClient();

    // const arrayBuffer = await attachment.file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);

    // const ext = attachment.file.name.split(".").pop()?.toLowerCase();

    // const fileKey = `${path}/main.${ext}`;
    // const thumbnailKey = `${path}/thumb.png`;

    // // const { data: _main, error } = await supabaseAdmin.storage
    // const { data: _main, error } = await supabase.storage
    //     .from(bucket)
    //     .upload(
    //         fileKey,
    //         buffer,
    //         {
    //             contentType: attachment.file.type,
    //             upsert: false,
    //         }
    //     );

    // // const mime = attachment.file.type;
    // // const thumbnailBuffer = await generateThumbnail(buffer, mime);

    // const thumbnailArrayBuffer = await attachment.thumbnail.arrayBuffer();
    // const thumbnailBuffer = Buffer.from(thumbnailArrayBuffer);

    // // const { data: _ } = await supabaseAdmin.storage
    // const { data: _ } = await supabase.storage
    //     .from(bucket)
    //     .upload(
    //         thumbnailKey,
    //         thumbnailBuffer,
    //         {
    //             contentType: "image/png",
    //         }
    //     );

    // if (error) throw new Error("failed to upload: " + error.message);

    // return {
    //     bucket,
    //     original_name: attachment.file.name,
    //     file_key: fileKey,
    //     file_type: attachment.file.type,
    //     file_size: attachment.file.size,
    //     thumbnail_key: thumbnailKey,
    //     thumbnail_type: "image/png",
    //     thumbnail_size: attachment.thumbnail.size,
    // };
}

export async function deleteFromSupabase(key: string, bucket = SUPABASE_STORAGE_BUCKET ?? "attachments") {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(bucket).remove([key]);
    // const { error } = await supabaseAdmin.storage.from(bucket).remove([key]);
    if (error) {
        console.error("storage delete error:", error);
        throw new Error("failed to delete file");
    }
}
