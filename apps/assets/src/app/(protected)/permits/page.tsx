import { findPermitMany } from "@/features/permits/repositories/permitRepository";
import { PermitList } from "@/features/permits/components/permitList";

export default async function PermitListPage() {
    const rows = await findPermitMany();
    return <PermitList rows={rows} />;
}
