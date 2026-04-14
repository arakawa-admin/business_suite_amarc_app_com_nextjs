import { NextRequest } from "next/server";
import { fetchMasterStaffById } from "@/lib/repositories/common/masterStaff.repository";
import { withAuth } from "@/lib/api/withAuth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    return withAuth<{ id: string }>(async ({ params: resolvedParams }) => {
        const data = await fetchMasterStaffById(resolvedParams.id);
        return Response.json(data);
    })(req, { params });
}
