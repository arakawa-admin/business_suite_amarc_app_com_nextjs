import { MasterListBase } from "../../shared/components/MasterListBase";
import type { PermitCategory } from "../types/permitCategoryTypes";

export function PermitCategoryList({ rows }: { rows: PermitCategory[] }) {
    return (
        <MasterListBase
            rows={rows}
            detailBasePath="/admin/permit-categories"
        />
    );
}
