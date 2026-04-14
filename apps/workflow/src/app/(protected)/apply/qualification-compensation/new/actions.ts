"use server";

import { qualificationCompensationSchema, type QualificationCompensationInput } from "@/features/apply/qualification-compensation/zod";
import { submitApplicationWithSchema } from "@/features/apply/_core/submit";

export async function submitQualificationCompensation(args: {
    input: QualificationCompensationInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        input: { ...args.input, _skipSkillsValidation: true },
        schema: qualificationCompensationSchema,
    });
}


export type SkillPayload = {
    is_add: boolean;
    skill_name: string;
    applicable_month: string;

    attachment_revision_ids: string[];
};
import { getApplicationById } from "@/lib/actions/apply/application";
import { getApplicationRevisionById, updateApplicationRevision } from "@/lib/actions/apply/applicationRevision";

export async function updateCurrentRevisionSkillsPayload(args: {
    application_id: string;
    skills: SkillPayload[];
}) {
    // 申請（親）から current_revision_id を取る
    const { data: app } = await getApplicationById(args.application_id);
    if (!app) throw new Error("申請情報の取得に失敗しました");

    const revisionId = app.current_revision_id;
    if (!revisionId) throw new Error("current_revision_id が取得できません");

    // 既存payload取得
    const { data: rev, error: revErr } = await getApplicationRevisionById(revisionId);
    if (!rev) throw new Error("申請履歴の取得に失敗しました");

    if (revErr) throw new Error(revErr);
    const currentPayload = (rev?.payload ?? {}) as Record<string, any>;

    // skills を差し替え（他のキーは維持）
    const nextPayload = {
        ...currentPayload,
        skills: args.skills,
    };

    // 更新
    const { error: updErr } = await updateApplicationRevision(
        revisionId,
        { payload: nextPayload }
    );
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const };
}
