"use client";

import {
    Button,
    Stack,
    Box,
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

import { ApprovalWithRelationsType } from "@/schemas/approval/approvalSchema";
import { ApprovalOrderType } from "@/schemas/approval/approvalOrderSchema";

import { upsertApprovalAction } from "@/services/approval/approvalActionService";

import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";

export default function ApprovalReturnForm({
    approval,
    approvalOrder,
    onSuccess,
    registerReset,
}: {
    approval: ApprovalWithRelationsType
    approvalOrder: ApprovalOrderType
    onSuccess?: () => void;
    registerReset?: (fn: () => void) => void;
}) {
    const { user, profile } = useAuth();

    const baseDefaults = useMemo(() => ({
        approval_id: approval.id || "",
        actor_user_id: profile?.id || "",
        action: "resubmit" as const,
        order_id: approvalOrder.id, // 承認者
        reviewer_id: undefined,
        comment: "",
        action_at: new Date(),
    }), [profile, approval, approvalOrder]);

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
                    toast.success("差し戻しに返答しました");
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

    const can = useMemo(() => {
        if (!["return"].includes(approvalOrder.status.code)) return false; // 差し戻し中以外は不可
        if (user?.is_admin) return true;
        return approval.author_id === profile?.id;
    }, [user, profile, approval, approvalOrder]);
    if( !can ) return null;

    return (
        <Box sx={{ mt: 2 }}>
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
                                    variant="contained"
                                    className={`bg-gradient-to-br from-warning-dark via-warning-main to-warning-light`}
                                    disabled={watchingComment?.length === 0 || methods.formState.isSubmitting}
                                    loading={pending}
                                    loadingPosition="start"
                                    >
                                    返答
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
                text={"差し戻しに返答しますか？"}
                okText={"返答する"}
                color={"warning"}
                />
        </Box>
    );
}
