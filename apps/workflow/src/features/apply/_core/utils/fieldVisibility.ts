import { getByPath, isEqualNormalized } from "./revisionDiff";
import type { Path } from "react-hook-form";

export type VisibleIf<T> = { name: Path<T>; equals: unknown };

export function isFieldVisible<T>(
    field: { visibleIf?: VisibleIf<T>; display?: { visible?: boolean } },
    latestPayload: unknown
): boolean {
      // display.visible === false は常に非表示（スイッチの「裏フラグ」用）
    if (field.display?.visible === false) return false;

    const cond = field.visibleIf;
    if (!cond) return true;

    const v = getByPath(latestPayload, String(cond.name));
    return isEqualNormalized(v, cond.equals);
}
