"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import { useAuth } from "@/contexts/AuthContext";

import UsePrivatelyOwnerVehicleForm from "@/features/apply/use-privately-owner-vehicle/Form";
import type { UsePrivatelyOwnerVehicleInput } from "@/features/apply/use-privately-owner-vehicle/zod";
import { submitUsePrivatelyOwnerVehicle } from "./actions";
import { submitRevisionAttachments } from "@/features/apply/_core/attachments";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "個人所有車使用許可申請";
    const FORM_CODE = "use-privately-owner-vehicle";

    const handleSubmit = async (values: UsePrivatelyOwnerVehicleInput) => {
        // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
        // ファイルそのものはserver componentに渡さないように。
        const { license_file, inspection_file, insurance_file, ...rest } = values;

        const res = await submitUsePrivatelyOwnerVehicle({
            input: rest,
            currentStaffId: profile.id,
            formCode: FORM_CODE,
        });

        if(license_file) {
            // R2保存
            const uploadedFiles = await uploadFiles({
                post_files: license_file,
                author_id: profile.id,
                path: `apply/${FORM_CODE}/${res.applicationId}`,
            });
            uploadedFiles[0].label="免許証"
            await submitRevisionAttachments({
                files: uploadedFiles,
                application_id: res.applicationId,
            })
        }
        if(inspection_file) {
            // R2保存
            const uploadedFiles = await uploadFiles({
                post_files: inspection_file,
                author_id: profile.id,
                path: `apply/${FORM_CODE}/${res.applicationId}`,
            });
            uploadedFiles[0].label="車検証"
            await submitRevisionAttachments({
                files: uploadedFiles,
                application_id: res.applicationId,
            })
        }
        if(insurance_file) {
            // R2保存
            const uploadedFiles = await uploadFiles({
                post_files: insurance_file,
                author_id: profile.id,
                path: `apply/${FORM_CODE}/${res.applicationId}`,
            });
            uploadedFiles[0].label="任意保険証"
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
            <UsePrivatelyOwnerVehicleForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
