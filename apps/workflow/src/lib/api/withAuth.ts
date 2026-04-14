import { requireAuth } from "@/lib/api/requireAuth";
import type { NextRequest } from "next/server";

type RouteHandler<TParams> = (
    req: NextRequest,
    context: { params: Promise<TParams> }
) => Promise<Response> | Response;

export function withAuth<TParams>(
    handler: (args: {
        req: NextRequest;
        params: TParams;
        user: any;
    }) => Promise<Response> | Response
): RouteHandler<TParams> {
    return async (req, context) => {
        const { user, response } = await requireAuth();
        if (response) return response;

        const params = await context.params;

        return handler({
            req,
            params,
            user,
        });
    };
}
