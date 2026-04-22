import { createClient } from "@supabase-shared/server";

export type CommentRow = {
    id: string;
    target_type: "vehicle" | "reminder";
    target_id: string;
    // comment_type_code: "memo" | "comment" | "reminder_response";
    body: string;
    source_type: "detail" | "email_link" | "manual" | null;
    // reminder_id: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
};

export type CommentListItem = CommentRow & {
    created_by_name: string | null;
    updated_by_name: string | null;
};

type InsertCommentParams = {
    targetType: "vehicle" | "reminder";
    targetId: string;
    // commentTypeCode: "memo" | "comment" | "reminder_response";
    body: string;
    sourceType?: "detail" | "email_link" | "manual" | null;
    // reminderId?: string | null;
    currentStaffId: string;
};

export async function insertComment(
    params: InsertCommentParams,
): Promise<CommentRow> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from("comments")
        .insert({
            target_type: params.targetType,
            target_id: params.targetId,
            // comment_type_code: params.commentTypeCode,
            body: params.body,
            source_type: params.sourceType ?? null,
            // reminder_id: params.reminderId ?? null,
            created_by: params.currentStaffId,
            updated_by: params.currentStaffId,
        })
        .select("*")
        .single();

    if (error) {
        throw new Error(`コメント登録に失敗しました: ${error.message}`);
    }

    return data;
}

export async function findCommentsByTarget(params: {
    targetType: "vehicle" | "reminder";
    targetId: string;
}): Promise<CommentListItem[]> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from("v_comments_list")
        .select(`*`)
        .eq("target_type", params.targetType)
        .eq("target_id", params.targetId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`コメント一覧の取得に失敗しました: ${error.message}`);
    }

    return data ?? [];
}

export async function findCommentById(commentId: string): Promise<CommentRow | null> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { data, error } = await assets
        .from("comments")
        .select("*")
        .eq("id", commentId)
        .maybeSingle();

    if (error) {
        throw new Error(`コメント取得に失敗しました: ${error.message}`);
    }

    return data;
}

export async function deleteCommentById(commentId: string): Promise<void> {
    const supabase = await createClient();
    const assets = supabase.schema("assets");

    const { error } = await assets
        .from("comments")
        .delete()
        .eq("id", commentId);

    if (error) {
        throw new Error(`コメント削除に失敗しました: ${error.message}`);
    }
}
