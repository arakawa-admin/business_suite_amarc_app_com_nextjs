import { NextRequest } from "next/server";
import { fetchMasterDepartmentByCode } from "@/lib/repositories/common/masterDepartment.repository";
import { withAuth } from "@/lib/api/withAuth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
): Promise<Response> {
    return withAuth<{ code: string }>(async ({ params: resolvedParams }) => {
        const data = await fetchMasterDepartmentByCode(resolvedParams.code);
        return Response.json(data);
    })(req, { params });
}
