"use server";

import { z } from "zod";
import { requireCurrentStaff } from "./auth";
import { createApplicationApproversAndViewers } from "@/services/apply/applicationService";
import { getMasterStatusByCode } from "@/lib/actions/apply/masterStatus";

type SubmitArgs<T extends z.ZodTypeAny> = {
    input: z.infer<T>;
    schema: T;
    currentStaffId: string;
    formCode: string;

    // 追加の後処理が欲しいフォーム向け
    afterCreated?: (ctx: {
        applicationId: string;
        revisionId: string;
        department_id: string;
        apply_form_id: string;
        staffId: string;
    }) => Promise<{ ok: true } | { ok: false; message: string }>;
};

export async function submitApplicationWithSchema<T extends z.ZodTypeAny>({
    input,
    schema,
    currentStaffId,
    formCode,
    afterCreated,
}: SubmitArgs<T>) {
    // 1) validate
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return { ok: false as const, message: "入力内容に不備があります" };
    }

    // 2) auth + staff verify
    const auth = await requireCurrentStaff(currentStaffId);
    if (!auth.ok) return { ok: false as const, message: auth.message };

    const supabase = auth.supabase;
    const apply = supabase.schema("apply");
    const staffId = auth.staffId;

    // 3) apply_forms lookup
    const { data: applyForm, error: applyFormErr } = await apply
        .from("apply_forms")
        .select("id")
        .eq("code", formCode)
        .maybeSingle();

    if (applyFormErr || !applyForm) {
        return { ok: false as const, message: "申請書が不明です" };
    }

    // 4) applications insert
    const initial_status_id = await getMasterStatusByCode("pending").then((res) => res.data?.id)
    if(!initial_status_id) return { ok: false as const, error: "初期ステータスを取得できません" }

    const { department_id, ...payload } = parsed.data as any;
    const { data: app, error: appErr } = await apply
        .from("applications")
        .insert({
            apply_form_id: applyForm.id,
            author_id: staffId,
            status_id: initial_status_id,
            department_id,
        })
        .select("id")
        .single();

    if (appErr || !app) {
        return {
            ok: false as const,
            message: appErr?.message ?? "申請の作成に失敗しました",
        };
    }

    // 5) revision insert
    const { data: rev, error: revErr } = await apply
        .from("application_revisions")
        .insert({
            application_id: app.id,
            revision_no: 1,
            payload,
            submitted_at: new Date().toISOString(),
            created_by: staffId,
        })
        .select("id")
        .single();

    if (revErr || !rev) {
        return {
            ok: false as const,
            message: revErr?.message ?? "申請内容の保存に失敗しました",
        };
    }

    // 6) current_revision update
    await apply
        .from("applications")
        .update({ current_revision_id: rev.id })
        .eq("id", app.id);

    // 7) approvers/viewers
    const { error: apviewerErr } = await createApplicationApproversAndViewers({
        application_id: app.id,
        department_id,
        apply_form_id: applyForm.id,
    });

    if (apviewerErr) {
        return {
            ok: false as const,
            message: apviewerErr ?? "承認及び閲覧者の保存に失敗しました",
        };
    }

    // 8) optional hook（添付の予約/通知など）
    if (afterCreated) {
        const hookRes = await afterCreated({
            applicationId: app.id,
            revisionId: rev.id,
            department_id,
            apply_form_id: applyForm.id,
            staffId,
        });
        if (!hookRes.ok)
            return { ok: false as const, message: hookRes.message };
    }

    return { ok: true as const, applicationId: app.id };
}
