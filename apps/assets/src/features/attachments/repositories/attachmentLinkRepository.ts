import { createClient } from "@supabase-shared/server";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

import type { AssetTargetType } from "@/features/shared/types/assetsDomainTypes";
import type {
    AttachmentLink,
    CreateAttachmentLinkInput,
    LinkedAttachmentListItem,
} from "../types/attachmentTypes";
import type {
    AttachmentRole,
} from "@/features/shared/types/assetsDomainTypes";

type AttachmentLinkRow = {
    id: string;
    attachment_id: string;
    target_type: AssetTargetType;
    target_id: string;
    attachment_role: AttachmentRole | null;
    sort_order: number;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    deleted_at: string | null;
    deleted_by: string | null;
};

function toAttachmentLinkModel(row: AttachmentLinkRow): AttachmentLink {
    return {
        id: row.id,
        attachmentId: row.attachment_id,
        targetType: row.target_type,
        targetId: row.target_id,
        attachmentRole: row.attachment_role,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
        createdBy: row.created_by,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        deletedBy: row.deleted_by,
    };
}

function toCreateAttachmentLinkRow(input: CreateAttachmentLinkInput) {
    return {
        attachment_id: input.attachmentId,
        target_type: input.targetType,
        target_id: input.targetId,
        attachment_role: input.attachmentRole ?? null,
        sort_order: input.sortOrder ?? 0,
        created_by: input.createdBy ?? null,
    };
}

export async function createAttachmentLink(
    input: CreateAttachmentLinkInput,
): Promise<{ id: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .insert(toCreateAttachmentLinkRow(input))
        .select("id")
        .single();

    if (error) {
        throw new Error(`createAttachmentLink failed: ${error.message}`);
    }

    return data as { id: string };
}

export async function createAttachmentLinks(
    inputs: CreateAttachmentLinkInput[],
): Promise<void> {
    if (inputs.length === 0) {
        return;
    }
    const supabase = await createClient();
    const currentStaffId = await findCurrentStaffIdOrThrow();

    const payload = inputs
                    .map(toCreateAttachmentLinkRow)
                    .map((v) => ({ ...v, created_by: currentStaffId }));

    const { error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .insert(payload);

    if (error) {
        throw new Error(`createAttachmentLinks failed: ${error.message}`);
    }
}

export async function findAttachmentLinkById(
    id: string,
): Promise<AttachmentLink | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw new Error(`findAttachmentLinkById failed: ${error.message}`);
    }

    return data ? toAttachmentLinkModel(data as AttachmentLinkRow) : null;
}

export async function findLinkedAttachmentsByTarget(params: {
    targetType: AssetTargetType;
    targetId: string;
}): Promise<LinkedAttachmentListItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .select(
            `
            id,
            attachment_id,
            target_type,
            target_id,
            attachment_role,
            sort_order,
            attachments!inner (
                id,
                original_filename,
                content_type,
                byte_size,
                uploaded_at,
                deleted_at
            )
            `,
        )
        .eq("target_type", params.targetType)
        .eq("target_id", params.targetId)
        .is("deleted_at", null)
        .is("attachments.deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(
            `findLinkedAttachmentsByTarget failed: ${error.message}`,
        );
    }

    return (data ?? []).map((row: any) => ({
        linkId: row.id,
        attachmentId: row.attachment_id,
        targetType: row.target_type,
        targetId: row.target_id,
        attachmentRole: row.attachment_role,
        sortOrder: row.sort_order,
        originalFilename: row.attachments.original_filename,
        contentType: row.attachments.content_type,
        byteSize: row.attachments.byte_size,
        uploadedAt: row.attachments.uploaded_at,
    }));
}

export async function softDeleteAttachmentLink(
    id: string,
    deletedBy: string | null,
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: deletedBy,
        })
        .eq("id", id)
        .is("deleted_at", null);

    if (error) {
        throw new Error(`softDeleteAttachmentLink failed: ${error.message}`);
    }
}

export async function softDeleteAttachmentLinksByTarget(params: {
    targetType: AssetTargetType;
    targetId: string;
    deletedBy: string | null;
}): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: params.deletedBy,
        })
        .eq("target_type", params.targetType)
        .eq("target_id", params.targetId)
        .is("deleted_at", null);

    if (error) {
        throw new Error(
            `softDeleteAttachmentLinksByTarget failed: ${error.message}`,
        );
    }
}
