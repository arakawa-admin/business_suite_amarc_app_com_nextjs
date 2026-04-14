import { NextRequest } from "next/server";
import { fetchMasterLoginUserById } from "@/lib/repositories/common/masterLoginUser.repository";
import { withAuth } from "@/lib/api/withAuth";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
): Promise<Response> {
    return withAuth<{ code: string }>(async ({ params: resolvedParams }) => {
        const data = await fetchMasterLoginUserById(resolvedParams.code);
        return Response.json(data);
    })(req, { params });
}
