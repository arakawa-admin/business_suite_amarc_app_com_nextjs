import { NextRequest } from "next/server";
import { fetchMasterDepartments } from "@/lib/repositories/common/masterDepartment.repository";
import { withAuthNoParams } from "@/lib/api/withAuthNoParams";

export async function GET(
    req: NextRequest,
): Promise<Response> {
    return withAuthNoParams(
        async () => {
            const data = await fetchMasterDepartments();
            return Response.json(data);
        }
    )(req);
}
