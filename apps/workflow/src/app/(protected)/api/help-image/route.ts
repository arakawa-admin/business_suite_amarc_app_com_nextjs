import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    // process.env.SUPABASE_URL!,
    "https://ebjlewzdbuwbzlmjlkvi.supabase.co",
    // process.env.SUPABASE_SERVICE_ROLE_KEY!
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViamxld3pkYnV3YnpsbWpsa3ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTE1NTA2NywiZXhwIjoyMDgwNzMxMDY3fQ.IlfKX12V1vo7loGFu23DdTDRyETmb-5j6C_KiPcXwAc"

);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    if (!path) return new NextResponse("Missing path", { status: 400 });

    // ログインチェック（NextAuth / Supabase Auth）
    // ★ここに auth check を入れる
    // if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { data, error } = await supabase.storage
        .from("help")
        .download(path);

    if (error) return new NextResponse("Not Found", { status: 404 });

    return new NextResponse(data, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
