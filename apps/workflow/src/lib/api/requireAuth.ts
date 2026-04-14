import { createClient } from "@supabase-shared/server";

export async function requireAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            response: new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401 }
            ),
        };
    }

    return { user, response: null };
}
