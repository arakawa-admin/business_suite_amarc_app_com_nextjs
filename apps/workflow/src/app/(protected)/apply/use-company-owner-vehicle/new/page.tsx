"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import { useAuth } from "@/contexts/AuthContext";

import UseCompanyOwnerVehicleForm from "@/features/apply/use-company-owner-vehicle/Form";
import type { UseCompanyOwnerVehicleInput } from "@/features/apply/use-company-owner-vehicle/zod";
import { submitUseCompanyOwnerVehicle } from "./actions";
import { submitRevisionAttachments } from "@/features/apply/_core/attachments";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "社有車使用許可申請";
    const FORM_CODE = "use-company-owner-vehicle";

    const handleSubmit = async (values: UseCompanyOwnerVehicleInput) => {
        // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
        // ファイルそのものはserver componentに渡さないように。
        const { post_files, ...rest } = values;

        const res = await submitUseCompanyOwnerVehicle({
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
            <UseCompanyOwnerVehicleForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
