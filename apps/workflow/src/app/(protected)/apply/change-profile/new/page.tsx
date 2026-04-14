"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";

import ChangeProfileForm from "@/features/apply/change-profile/Form";
import type { ChangeProfileInput } from "@/features/apply/change-profile/zod";
import { submitChangeProfile } from "./actions";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "変更届";
    const FORM_CODE = "change-profile";

    const handleSubmit = async (values: ChangeProfileInput) => {
        const res = await submitChangeProfile({
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
            <ChangeProfileForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
