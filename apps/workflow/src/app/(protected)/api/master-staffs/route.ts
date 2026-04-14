import { NextRequest } from "next/server";
import { fetchMasterStaffs } from "@/lib/repositories/common/masterStaff.repository";
import { withAuthNoParams } from "@/lib/api/withAuthNoParams";

export async function GET(
    req: NextRequest,
): Promise<Response> {
    return withAuthNoParams(
        async () => {
            const data = await fetchMasterStaffs();
            return Response.json(data);
        }
    )(req);
}
