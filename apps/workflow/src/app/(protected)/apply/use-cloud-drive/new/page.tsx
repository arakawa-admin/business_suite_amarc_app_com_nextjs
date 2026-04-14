"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";

import UseCloudDriveForm from "@/features/apply/use-cloud-drive/Form";
import type { UseCloudDriveInput } from "@/features/apply/use-cloud-drive/zod";
import { submitUseCloudDrive } from "./actions";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "ファイル共有ドライブ使用申請";
    const FORM_CODE = "use-cloud-drive";

    const handleSubmit = async (values: UseCloudDriveInput) => {
        const res = await submitUseCloudDrive({
            input: values,
            currentStaffId: profile.id,
            formCode: FORM_CODE,
        });

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
            <UseCloudDriveForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
