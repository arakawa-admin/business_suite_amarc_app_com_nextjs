import { MasterDetailBase } from "../../../shared/components/MasterDetailBase";
import type { PermitCategory } from "../types/permitCategoryTypes";

export function PermitCategoryDetail({ item }: { item: PermitCategory }) {
    return (
        <MasterDetailBase
            item={item}
            editHref={`/admin/permit/permit-categories/${item.id}/edit`}
        />
    );
}
