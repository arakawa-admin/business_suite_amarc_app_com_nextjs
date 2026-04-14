import type {
    MasterCommonRow,
    MasterValidityStatus,
} from "../types/masterCommonTypes";

type MasterValidityTarget = Pick<MasterCommonRow, "validAt" | "invalidAt">;

export function resolveMasterValidityStatus(
    target: MasterValidityTarget,
    at = new Date(),
): MasterValidityStatus {
    const now = at.getTime();
    const validAt = target.validAt ? new Date(target.validAt).getTime() : null;
    const invalidAt = target.invalidAt
        ? new Date(target.invalidAt).getTime()
        : null;

    if (validAt !== null && validAt > now) {
        return "upcoming";
    }

    if (invalidAt !== null && invalidAt <= now) {
        return "expired";
    }

    return "active";
}

export function isMasterActive(
    target: MasterValidityTarget,
    at = new Date(),
): boolean {
    return resolveMasterValidityStatus(target, at) === "active";
}

export function resolveMasterValidityStatusName(
    status: MasterValidityStatus,
): string {
    switch (status) {
        case "upcoming":
            return "有効前";
        case "active":
            return "有効";
        case "expired":
            return "期限切れ";
        default:
            return "不明";
    }
}
