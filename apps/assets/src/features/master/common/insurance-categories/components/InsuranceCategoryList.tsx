import { MasterListBase } from "../../../shared/components/MasterListBase";
import type { InsuranceCategory } from "../types/insuranceCategoryTypes";

export function InsuranceCategoryList({ rows }: { rows: InsuranceCategory[] }) {
    return (
        <MasterListBase
            rows={rows}
            detailBasePath="/admin/common/insurance-categories"
        />
    );
}
