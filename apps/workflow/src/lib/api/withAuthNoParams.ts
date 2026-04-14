import { requireAuth } from "@/lib/api/requireAuth";
import type { NextRequest } from "next/server";

export function withAuthNoParams(
    handler: (args: {
        req: NextRequest;
        user: any;
    }) => Promise<Response> | Response
) {
    return async (req: NextRequest): Promise<Response> => {
        const { user, response } = await requireAuth();
        if (response) return response;

        return handler({ req, user });
    };
}
