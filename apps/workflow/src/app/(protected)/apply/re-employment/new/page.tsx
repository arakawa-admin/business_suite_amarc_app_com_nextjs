"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";

import ReEmploymentForm from "@/features/apply/re-employment/Form";
import type { ReEmploymentInput } from "@/features/apply/re-employment/zod";
import { submitReEmployment } from "./actions";

import ApplicationFormWrapper from "@/components/apply/parts/ApplicationFormWrapper";

export default function Page() {
    const router = useRouter();
    const { profile } = useAuth();

    if(!profile) { return }

    const APPLY_NAME = "再雇用希望申請";
    const FORM_CODE = "re-employment";

    const handleSubmit = async (values: ReEmploymentInput) => {
        const res = await submitReEmployment({
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
            <ReEmploymentForm onSubmit={handleSubmit} />
        </ApplicationFormWrapper>
    );
}
