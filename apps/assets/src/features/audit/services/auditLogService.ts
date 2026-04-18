import {
    insertAuditLog,
    type AuditEntityType,
} from "../repositories/auditLogRepository";

type JsonLike =
    | string
    | number
    | boolean
    | null
    | JsonLike[]
    | { [key: string]: JsonLike };

type AuditLogBaseParams = {
    entityType: AuditEntityType;
    entityId: string;
    currentStaffId: string;
    summary?: string | null;
    metadata?: Record<string, unknown>;
};

type LogCreateAuditParams = AuditLogBaseParams & {
    created?: Record<string, JsonLike>;
};

type LogDeleteAuditParams = AuditLogBaseParams & {
    deleted?: Record<string, JsonLike>;
};

type LogRestoreAuditParams = AuditLogBaseParams & {
    restored?: Record<string, JsonLike>;
};

type BuildAuditDiffParams<T extends Record<string, unknown>> = {
    before: T;
    after: T;
    keys?: (keyof T)[];
};

type AuditDiff<T extends Record<string, unknown>> = {
    changedFields: (keyof T)[];
    before: Partial<T>;
    after: Partial<T>;
};

type LogUpdateAuditParams<T extends Record<string, unknown>> =
    AuditLogBaseParams & {
        diff: AuditDiff<T>;
    };

function isEqualValue(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function buildAuditDiff<T extends Record<string, unknown>>(
    params: BuildAuditDiffParams<T>,
): AuditDiff<T> {
    const keys = params.keys ?? (Object.keys(params.after) as (keyof T)[]);

    const changedFields: (keyof T)[] = [];
    const before: Partial<T> = {};
    const after: Partial<T> = {};

    for (const key of keys) {
        const beforeValue = params.before[key];
        const afterValue = params.after[key];

        if (!isEqualValue(beforeValue, afterValue)) {
            changedFields.push(key);
            before[key] = beforeValue;
            after[key] = afterValue;
        }
    }

    return {
        changedFields,
        before,
        after,
    };
}

export async function logCreateAudit(
    params: LogCreateAuditParams,
): Promise<void> {
    await insertAuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        actionCode: "create",
        summary: params.summary ?? null,
        metadata: {
            ...(params.metadata ?? {}),
            created: params.created ?? null,
        },
        currentStaffId: params.currentStaffId,
    });
}

export async function logDeleteAudit(
    params: LogDeleteAuditParams,
): Promise<void> {
    await insertAuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        actionCode: "delete",
        summary: params.summary ?? null,
        metadata: {
            ...(params.metadata ?? {}),
            deleted: params.deleted ?? null,
        },
        currentStaffId: params.currentStaffId,
    });
}

export async function logUpdateAudit<T extends Record<string, unknown>>(
    params: LogUpdateAuditParams<T>,
): Promise<void> {
    if (params.diff.changedFields.length === 0) {
        return;
    }

    await insertAuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        actionCode: "update",
        summary: params.summary ?? null,
        metadata: {
            ...(params.metadata ?? {}),
            changed_fields: params.diff.changedFields,
            before: params.diff.before,
            after: params.diff.after,
        },
        currentStaffId: params.currentStaffId,
    });
}


export async function logRestoreAudit(
    params: LogRestoreAuditParams,
): Promise<void> {
    await insertAuditLog({
        entityType: params.entityType,
        entityId: params.entityId,
        actionCode: "restore",
        summary: params.summary ?? null,
        metadata: {
            ...(params.metadata ?? {}),
            restored: params.restored ?? null,
        },
        currentStaffId: params.currentStaffId,
    });
}
