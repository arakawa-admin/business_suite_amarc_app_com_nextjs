export type AuditEntityType = "permit" | "reminder" | "comment";

export type AuditLogListItem = {
    id: string;
    entity_type: AuditEntityType;
    entity_id: string;
    action_code: string;
    action_name: string;
    summary: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    created_by: string | null;
    created_by_name: string | null;
};
