"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";

import UseGoogleAccountForm from "@/features/apply/use-google-account/Form";
import type { UseGoogleAccountInput } from "@/features/apply/use-google-account/zod";
import { submitUseGoogleAccount } from "./actions";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "googleアカウント個人端末使用申請";
    const FORM_CODE = "use-google-account";

    const handleSubmit = async (values: UseGoogleAccountInput) => {
        const res = await submitUseGoogleAccount({
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
            <UseGoogleAccountForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
