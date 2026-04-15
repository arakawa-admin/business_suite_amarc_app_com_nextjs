import { createClient } from "@supabase-shared/server";
import { createAdminClient } from "@supabase-shared/admin";

import type {
    Attachment,
    AttachmentListItem,
    CreateAttachmentInput,
} from "../types/attachmentTypes";

type AttachmentRow = {
    id: string;
    storage_bucket: string;
    storage_key: string;
    original_filename: string;
    content_type: string | null;
    byte_size: number;
    sha256: string | null;
    remarks: string | null;
    linked_at: string | null;
    uploaded_by: string | null;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    deleted_by: string | null;
};

function toAttachmentModel(row: AttachmentRow): Attachment {
    return {
        id: row.id,
        storageBucket: row.storage_bucket,
        storageKey: row.storage_key,
        originalFilename: row.original_filename,
        contentType: row.content_type,
        byteSize: row.byte_size,
        sha256: row.sha256,
        remarks: row.remarks,
        linkedAt: row.linked_at,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
    };
}

function toCreateAttachmentRow(input: CreateAttachmentInput) {
    return {
        storage_bucket: input.storageBucket ?? "assets-amarc-app-com",
        storage_key: input.storageKey,
        original_filename: input.originalFilename,
        content_type: input.contentType,
        byte_size: input.byteSize,
        sha256: input.sha256 ?? null,
        remarks: input.remarks ?? null,
        uploaded_by: input.uploadedBy ?? null,
    };
}

export async function createAttachment(
    input: CreateAttachmentInput,
): Promise<{ id: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachments")
        .insert(toCreateAttachmentRow(input))
        .select("id")
        .single();

    if (error) {
        throw new Error(`createAttachment failed: ${error.message}`);
    }

    return data as { id: string };
}

export async function findAttachmentById(
    id: string,
): Promise<Attachment | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`findAttachmentById failed: ${error.message}`);
    }

    return data ? toAttachmentModel(data as AttachmentRow) : null;
}

export async function findActiveAttachmentByStorageKey(
    storageKey: string,
): Promise<Attachment | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachments")
        .select("*")
        .eq("storage_key", storageKey)
        .is("deleted_at", null)
        .maybeSingle();

    if (error) {
        throw new Error(
            `findActiveAttachmentByStorageKey failed: ${error.message}`,
        );
    }

    return data ? toAttachmentModel(data as AttachmentRow) : null;
}

export async function findRecentAttachments(
    limit = 20,
): Promise<AttachmentListItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachments")
        .select("id, original_filename, content_type, byte_size, uploaded_at")
        .is("deleted_at", null)
        .order("uploaded_at", { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`findRecentAttachments failed: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
        id: row.id as string,
        originalFilename: row.original_filename as string,
        contentType: row.content_type as string | null,
        byteSize: row.byte_size as number,
        uploadedAt: row.uploaded_at as string,
    }));
}

export async function softDeleteAttachment(
    id: string,
    deletedBy: string | null,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachments")
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: deletedBy,
        })
        .eq("id", id)
        .is("deleted_at", null);

    if (error) {
        throw new Error(`softDeleteAttachment failed: ${error.message}`);
    }
}

type StaleUnlinkedAttachment = {
    id: string;
    storageBucket: string;
    storageKey: string;
};

export async function markAttachmentsLinked(
    attachmentIds: string[],
): Promise<void> {
    if (attachmentIds.length === 0) {
        return;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachments")
        .update({
            linked_at: new Date().toISOString(),
        })
        .in("id", attachmentIds)
        .is("deleted_at", null)
        .is("linked_at", null);

    if (error) {
        throw new Error(`markAttachmentsLinked failed: ${error.message}`);
    }
}

// for cron
export async function findStaleUnlinkedAttachmentsForCleanup(params?: {
    olderThanHours?: number;
    limit?: number;
}): Promise<StaleUnlinkedAttachment[]> {
    const olderThanHours = params?.olderThanHours ?? 24;
    const limit = params?.limit ?? 100;

    const threshold = new Date(
        Date.now() - olderThanHours * 60 * 60 * 1000,
    ).toISOString();

    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachments")
        .select("id, storage_bucket, storage_key")
        .is("deleted_at", null)
        .is("linked_at", null)
        .lt("created_at", threshold)
        .order("created_at", { ascending: true })
        .limit(limit);
    if (error) {
        throw new Error(
            `findStaleUnlinkedAttachments failed: ${error.message}`,
        );
    }

    return (data ?? []).map((row) => ({
        id: row.id as string,
        storageBucket: row.storage_bucket as string,
        storageKey: row.storage_key as string,
    }));
}
// for cron
export async function hardDeleteAttachments(
    attachmentIds: string[],
): Promise<void> {
    if (attachmentIds.length === 0) {
        return;
    }
    const supabase = await createAdminClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachments")
        .delete()
        .in("id", attachmentIds)
        .is("linked_at", null);

    if (error) {
        throw new Error(`hardDeleteAttachments failed: ${error.message}`);
    }
}
