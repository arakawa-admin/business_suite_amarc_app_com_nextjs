"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import { useAuth } from "@/contexts/AuthContext";

import PartTimeEmploymentForm from "@/features/apply/part-time-employment/Form";
import type { PartTimeEmploymentInput } from "@/features/apply/part-time-employment/zod";
import { submitPartTimeEmployment, updateCurrentRevisionSkillsPayload } from "./actions";
import { submitRevisionAttachments } from "@/features/apply/_core/attachments";

import { AttachmentCreateInput } from '@/schemas/approval/attachmentSchema';
import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "パート社員雇用継続申請";
    const FORM_CODE = "part-time-employment";

    const handleSubmit = async (values: PartTimeEmploymentInput) => {
        // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
        // ファイルそのものはserver componentに渡さないように。
        const { skills, ...rest } = values;

        const res = await submitPartTimeEmployment({
            input: rest,
            currentStaffId: profile.id,
            formCode: FORM_CODE,
        });
        if (!res?.ok){
            toast.error(res.message);
            throw new Error("申請の作成に失敗しました");
        }

        if (skills && skills?.length > 0) {
            // 3) skillsごとにアップロード（並列）※ post_files 複数対応
            const uploadResults = await Promise.all(
                skills.map(async (skill) => {
                    const files = skill.post_files ?? [];
                    if (!files.length) {
                        return { skill, fileInputs: [] as AttachmentCreateInput[] };
                    }

                    // ファイルごとにアップロード（並列）
                    const uploadedList = await Promise.all(
                        files.map(async (file) => {
                            const uploadedFiles = await uploadFiles({
                                post_files: [file], // uploadFilesが複数対応でも、1件ずつにしておくと順序が安定
                                author_id: profile.id,
                                path: `apply/${FORM_CODE}/${res.applicationId}`,
                            });

                            const uploaded = uploadedFiles?.[0];
                            if (!uploaded) return null;

                            const { id: _, ...rest } = uploaded;

                            const fileInput: AttachmentCreateInput = {
                                ...rest,
                                label: skill.skill_name, // skill単位のラベル
                            };

                            return fileInput;
                        })
                    );

                    return {
                        skill,
                        fileInputs: uploadedList.filter((v): v is AttachmentCreateInput => v != null),
                    };
                })
            );

            // 4) DB保存用の files を作成（flat）
            const filesToSave = uploadResults.flatMap((x) => x.fileInputs);

            let saveRes:
                | { ok: true; data: { revision_attachment_id: string }[] }
                | { ok: false; data?: any } = { ok: true, data: [] };

            if (filesToSave.length) {
                saveRes = await submitRevisionAttachments({
                    application_id: res.applicationId,
                    files: filesToSave,
                });
                if (!saveRes.ok) throw new Error("添付ファイルの保存に失敗しました");
            }

            // 5) saveRes.data を skills に戻す（skillごとの件数でslice）
            let j = 0;
            const nextSkillsPayload = uploadResults.map(({ skill, fileInputs }) => {
                const { post_files: _, ...restSkill } = skill;

                const count = fileInputs.length;
                const createdForSkill = saveRes.data.slice(j, j + count);
                j += count;

                const createdIds = createdForSkill.map((x) => x.revision_attachment_id);

                return {
                    ...restSkill,
                    // 既存があれば維持しつつ追加（初回なら [] でOK）
                    attachment_revision_ids: [
                        ...(restSkill.attachment_revision_ids ?? []),
                        ...createdIds,
                    ],
                };
            });

            await updateCurrentRevisionSkillsPayload({
                application_id: res.applicationId,
                skills: nextSkillsPayload,
            });
        }

        toast.success("申請しました");
        if (res.applicationId) {
            router.push(`/apply/${FORM_CODE}/${res.applicationId}`); // 詳細へ
            return;
        }
        router.refresh();
    };

    return (
        <ApplicationFormWrapper
            applyName={APPLY_NAME}
            formCode={FORM_CODE}
            >
            <PartTimeEmploymentForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
