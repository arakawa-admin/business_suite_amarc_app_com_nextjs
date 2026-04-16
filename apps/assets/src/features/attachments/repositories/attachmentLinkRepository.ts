import { createClient } from "@supabase-shared/server";
import { findCurrentStaffIdOrThrow } from "@/features/auth/repositories/currentStaffRepository";

import type { AssetTargetType } from "@/features/shared/types/assetsDomainTypes";
import type {
    AttachmentLink,
    CreateAttachmentLinkInput,
    LinkedAttachmentListItem,
} from "../types/attachmentTypes";
import type { AttachmentRole } from "@/features/shared/types/assetsDomainTypes";

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

export async function findActiveAttachmentLinksByTarget(params: {
    targetType: AssetTargetType;
    targetId: string;
}): Promise<AttachmentLink[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .select("*")
        .eq("target_type", params.targetType)
        .eq("target_id", params.targetId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(
            `findActiveAttachmentLinksByTarget failed: ${error.message}`,
        );
    }

    return (data ?? []).map((row) =>
        toAttachmentLinkModel(row as AttachmentLinkRow),
    );
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

export async function softDeleteAttachmentLinksByIds(params: {
    ids: string[];
    deletedBy: string | null;
}): Promise<void> {
    if (params.ids.length === 0) {
        return;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: params.deletedBy,
        })
        .in("id", params.ids)
        .is("deleted_at", null);

    if (error) {
        throw new Error(
            `softDeleteAttachmentLinksByIds failed: ${error.message}`,
        );
    }
}

export async function updateAttachmentLinkSortOrder(params: {
    id: string;
    sortOrder: number;
}): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .schema("assets")
        .from("attachment_links")
        .update({
            sort_order: params.sortOrder,
        })
        .eq("id", params.id)
        .is("deleted_at", null);

    if (error) {
        throw new Error(
            `updateAttachmentLinkSortOrder failed: ${error.message}`,
        );
    }
}

export async function syncAttachmentLinks(params: {
    targetType: AssetTargetType;
    targetId: string;
    attachments: {
        attachmentId: string;
        attachmentRole?: AttachmentRole | null;
    }[];
    createdBy: string | null;
    deletedBy: string | null;
}): Promise<void> {
    /**
     * 目的:
     * - クライアントから送られてきた「最終的に残したい添付一覧」を正として、
     *   attachment_links をサーバ側で同期する
     *
     * やること:
     * 1. 既存の active link 一覧を取得する
     * 2. 今回送られてきた attachmentId 一覧と比較する
     * 3. 新規追加分だけ create する
     * 4. 画面から消えた分は soft delete する
     * 5. 最後に sort_order を画面の並び順に合わせて更新する
     *
     * こうしておくことで、
     * - 既存添付の二重 insert を防げる
     * - 削除も表現できる
     * - 並び順変更にも対応できる
     */

    // --------------------------------------------------
    // 1. 現在 DB に存在する active なリンクを取得する
    // --------------------------------------------------
    const existingLinks = await findActiveAttachmentLinksByTarget({
        targetType: params.targetType,
        targetId: params.targetId,
    });

    /**
     * existingLinks:
     *   今この target に紐づいている attachment_links
     *
     * params.attachments:
     *   クライアントが「この並び・この内容で残したい」と送ってきた最終形
     */

    // --------------------------------------------------
    // 2. 比較しやすいように attachmentId の集合を作る
    // --------------------------------------------------
    const incomingAttachmentIds = new Set(
        params.attachments.map((item) => item.attachmentId),
    );

    const existingAttachmentIds = new Set(
        existingLinks.map((link) => link.attachmentId),
    );

    // --------------------------------------------------
    // 3. DB にまだ無い添付だけ create 対象にする
    // --------------------------------------------------
    const toCreate = params.attachments.filter(
        (item) => !existingAttachmentIds.has(item.attachmentId),
    );
    /**
     * toCreate:
     *   クライアントから来たが、まだ DB には存在しない attachment
     *
     * 例:
     *   existing = [A, B]
     *   incoming = [A, B, C]
     *   → toCreate = [C]
     */

    // --------------------------------------------------
    // 4. 今回の送信に含まれなかった既存添付は delete 対象にする
    // --------------------------------------------------
    const toDelete = existingLinks.filter(
        (link) => !incomingAttachmentIds.has(link.attachmentId),
    );

    /**
     * toDelete:
     *   以前は紐づいていたが、今回の最終一覧からは外れた attachment
     *
     * 例:
     *   existing = [A, B, C]
     *   incoming = [A, C]
     *   → toDelete = [B]
     */

    // --------------------------------------------------
    // 5. 新規追加分だけ insert する
    // --------------------------------------------------
    if (toCreate.length > 0) {
        await createAttachmentLinks(
            toCreate.map((item) => ({
                attachmentId: item.attachmentId,
                targetType: params.targetType,
                targetId: params.targetId,
                attachmentRole: item.attachmentRole ?? "general",

                /**
                 * sortOrder は「今回クライアントが送ってきた最終並び」に合わせる。
                 * 新規追加分だけでも、全体の並び順の中で何番目かを見て採番する。
                 */
                sortOrder:
                    params.attachments.findIndex(
                        (x) => x.attachmentId === item.attachmentId,
                    ) + 1,

                createdBy: params.createdBy,
            })),
        );
    }

    // --------------------------------------------------
    // 6. 画面から消えた既存添付は soft delete する
    // --------------------------------------------------
    if (toDelete.length > 0) {
        await softDeleteAttachmentLinksByIds({
            ids: toDelete.map((item) => item.id),
            deletedBy: params.deletedBy,
        });
    }

    // --------------------------------------------------
    // 7. create / delete 後の最新 active links を再取得する
    // --------------------------------------------------
    const nextLinks = await findActiveAttachmentLinksByTarget({
        targetType: params.targetType,
        targetId: params.targetId,
    });

    /**
     * なぜ再取得するか:
     * - create したリンクには DB 側で新しい id が付く
     * - delete 後の「残っている active links」のみで sort_order を揃えたい
     */

    const nextByAttachmentId = new Map(
        nextLinks.map((link) => [link.attachmentId, link]),
    );

    // --------------------------------------------------
    // 8. 最終並び順に合わせて sort_order を更新する
    // --------------------------------------------------
    for (const [index, item] of params.attachments.entries()) {
        const link = nextByAttachmentId.get(item.attachmentId);

        // 念のため。通常は存在する想定
        if (!link) {
            continue;
        }

        const nextSortOrder = index + 1;

        // 変化がある時だけ update する
        if (link.sortOrder !== nextSortOrder) {
            await updateAttachmentLinkSortOrder({
                id: link.id,
                sortOrder: nextSortOrder,
            });
        }
    }
}
