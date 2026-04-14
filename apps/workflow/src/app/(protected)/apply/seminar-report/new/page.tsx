"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import { useAuth } from "@/contexts/AuthContext";

import SeminarReportForm from "@/features/apply/seminar-report/Form";
import type { SeminarReportInput } from "@/features/apply/seminar-report/zod";
import { submitSeminarReport } from "./actions";
import { submitRevisionAttachments } from "@/features/apply/_core/attachments";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "講演会/セミナー報告書";
    const FORM_CODE = "seminar-report";

    const handleSubmit = async (values: SeminarReportInput) => {
        // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
        // ファイルそのものはserver componentに渡さないように。
        const { post_files, ...rest } = values;

        const res = await submitSeminarReport({
            input: rest,
            currentStaffId: profile.id,
            formCode: FORM_CODE,
        });

        if(post_files) {
            // R2保存
            const uploadedFiles = await uploadFiles({
                post_files: post_files,
                author_id: profile.id,
                path: `apply/${FORM_CODE}/${res.applicationId}`,
            });
            await submitRevisionAttachments({
                files: uploadedFiles,
                application_id: res.applicationId,
            })
        }

        if (!res.ok) {
            toast.error(res.message);
            return;
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
            <SeminarReportForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
