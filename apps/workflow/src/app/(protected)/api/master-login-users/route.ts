import { NextRequest } from "next/server";
import { fetchMasterLoginUsers } from "@/lib/repositories/common/masterLoginUser.repository";
import { withAuthNoParams } from "@/lib/api/withAuthNoParams";

export async function GET(
    req: NextRequest,
): Promise<Response> {
    return withAuthNoParams(
        async () => {
            const data = await fetchMasterLoginUsers();
            return Response.json(data);
        }
    )(req);
}
