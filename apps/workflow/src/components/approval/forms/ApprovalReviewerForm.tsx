"use client";

import {
    Button,
    Container,
    Stack,
    Paper,
} from "@mui/material";

import { useAuth } from "@/contexts/AuthContext";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useMemo, useTransition } from "react";

import {
    ApprovalActionUpsertInput,
    approvalActionUpsertSchema,
} from "@/schemas/approval/approvalActionSchema";
import { ApprovalReviewerType } from "@/schemas/approval/approvalReviewerSchema";

import { upsertApprovalAction } from "@/services/approval/approvalActionService";

import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";

export default function ApprovalReviewerForm({
    approvalReviewerItem,
    onSuccess,
    registerReset,
}: {
    approvalReviewerItem: ApprovalReviewerType
    onSuccess?: () => void;
    registerReset?: (fn: () => void) => void;
}) {
    const { profile } = useAuth();

    const baseDefaults = useMemo(() => ({
        approval_id: approvalReviewerItem.approval_id || "",
        actor_user_id: profile?.id || "",
        action: "submit" as const,
        order_id: undefined,
        reviewer_id: approvalReviewerItem.id,
        comment: "",
        action_at: new Date(),
    }), [profile, approvalReviewerItem]);

    const methods = useForm<ApprovalActionUpsertInput>({
        resolver: zodResolver(approvalActionUpsertSchema),
        defaultValues: baseDefaults,
        mode: "onBlur",
    });

    useEffect(() => {
        registerReset?.(() => methods.reset());
    }, [registerReset, methods]);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<ApprovalActionUpsertInput | null>(null);

    const handleConfirmSubmit = (data: ApprovalActionUpsertInput) => {
        setFormData(data);
        setConfirmOpen(true);
    };
    const handleConfirmedSubmit = async () => {
        if (!formData) return;
        await onSubmit(formData);
        setConfirmOpen(false);
    };

    const [pending, start] = useTransition();
    const onSubmit = async (data: ApprovalActionUpsertInput) => {
        start(async () => {
            try {
                if(!profile) throw new Error("ユーザ情報の取得に失敗しました");

                const payload = {
                    ...data,
                    action_at: new Date(),
                };

                const res = await upsertApprovalAction(payload);
                if (!res.ok) {
                    toast.error(res.error);
                } else {
                    toast.success("回議コメントを提出しました");
                    setTimeout(() => { start(() => {
                        onSuccess?.();
                        methods.reset(); // フォームリセット
                    }); }, 100);
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "");
            }
        });
    };

    const watchingComment = useWatch({ control: methods.control, name: "comment" });
    const watchingAction = useWatch({ control: methods.control, name: "action" });

    const actionType = () => {
        switch(watchingAction){
            case "reviewer_comment": {
                return { label: "回議コメント", color: "info" };
            }
        }
    };

    if( approvalReviewerItem.reviewer_user_id !== profile?.id ) return null;

    return (
        <Container maxWidth="xl">
            <Paper
                variant="outlined"
                sx={{ p: 2 }}
                >
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleConfirmSubmit)}>
                        <Stack spacing={1}>
                            <TextInputField
                                name="comment"
                                label="コメント"
                                required
                                />

                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                spacing={1}
                                >
                                <Button
                                    type="submit"
                                    onClick={() => methods.setValue("action", "reviewer_comment")}
                                    variant="contained"
                                    className={`bg-gradient-to-br from-info-dark via-info-main to-info-light`}
                                    disabled={watchingComment?.length === 0 || methods.formState.isSubmitting}
                                    loading={pending}
                                    loadingPosition="start"
                                    >
                                    コメントする
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </FormProvider>
            </Paper>

            <DialogConfirm
                isOpen={confirmOpen}
                onDone={handleConfirmedSubmit}
                onCancel={() => setConfirmOpen(false)}
                text={`${actionType() ? actionType()?.label : "登録"}しますか?`}
                okText={`${actionType() ? actionType()?.label : "登録"}する`}
                color={`${actionType() ? actionType()?.color : "info"}` as "error" | "inherit" | "warning" | "primary" | "secondary" | "success" | "info"}
                />
        </Container>
    );
}
