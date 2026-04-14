"use server";

import { submitApplicationWithSchema } from "@/features/apply/_core/submit";
import { endTrialEmploymentSchema, type EndTrialEmploymentInput } from "@/features/apply/end-trial-employment/zod";

export async function submitEndTrialEmployment(args: {
    input: EndTrialEmploymentInput;
    currentStaffId: string;
    formCode: string;
}) {
    return submitApplicationWithSchema({
        ...args,
        schema: endTrialEmploymentSchema,
    });
}



export type SkillPayload = {
    skill_name: string;
    attachment_revision_ids: string[];

    // // 参照を payload に埋めたいなら file_key を推奨
    // attachment_file_key?: string | null;
    // // 他にも項目があるならここに追加
    // [key: string]: any;
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
