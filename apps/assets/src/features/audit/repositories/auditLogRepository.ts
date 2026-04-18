import { createClient } from "@supabase-shared/server";
import type { AuditEntityType, AuditLogListItem } from "../types/auditLogTypes";

export type InsertAuditLogParams = {
    entityType: AuditEntityType;
    entityId: string;
    actionCode: string;
    summary?: string | null;
    metadata?: Record<string, unknown>;
    currentStaffId: string;
};

export async function insertAuditLog(
    params: InsertAuditLogParams,
): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { error } = await assets.from("audit_logs").insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        action_code: params.actionCode,
        summary: params.summary ?? null,
        metadata: params.metadata ?? {},
        created_by: params.currentStaffId,
    });

    if (error) {
        throw new Error(`監査ログ登録に失敗しました: ${error.message}`);
    }
}

export async function findAuditLogs(params?: {
    entityType?: AuditEntityType;
    entityId?: string;
    limit?: number;
}): Promise<AuditLogListItem[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    let query = assets
        .from("v_audit_logs_list")
        .select("*")
        .order("created_at", { ascending: false });

    if (params?.entityType) {
        query = query.eq("entity_type", params.entityType);
    }

    if (params?.entityId) {
        query = query.eq("entity_id", params.entityId);
    }

    if (params?.limit) {
        query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`監査ログ一覧の取得に失敗しました: ${error.message}`);
    }

    return (data ?? []) as AuditLogListItem[];
}
