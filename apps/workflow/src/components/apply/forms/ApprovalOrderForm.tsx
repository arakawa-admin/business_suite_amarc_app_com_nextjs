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
} from "@/schemas/apply/approvalActionSchema";
import { ApprovalOrderType } from "@/schemas/apply/approvalOrderSchema";

import { upsertApprovalAction } from "@/services/apply/approvalActionService";
import { postActionAttachments } from "@/services/apply/approvalAttachmentService";

import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import FileInputField from "@ui/form/FileInputField";
import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

export default function ApprovalOrderForm({
    approvalOrder,
    onSuccess,
    registerReset,
}: {
    approvalOrder: ApprovalOrderType;
    onSuccess?: () => void;
    registerReset?: (fn: () => void) => void;
}) {
    const { user, profile } = useAuth();

    const baseDefaults = useMemo(() => ({
        application_id: approvalOrder.application_id || "",
        actor_user_id: profile?.id || "",
        action: "submit" as const,
        order_id: approvalOrder.id,
        reviewer_id: undefined,
        comment: "",
        action_at: new Date(),

        // for attachment_actions
        post_files: [],
    }), [profile, approvalOrder]);

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

                // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
                // ファイルそのものはserver componentに渡さないように。
                const { post_files: _post_files, ...rest } = data

                const payload = {
                    ...rest,
                    action_at: new Date(),
                };

                const res = await upsertApprovalAction(payload);
                if (!res.ok) {
                    toast.error(res.error);
                } else {
                    // R2保存
                    const uploadedFiles = await uploadFiles({
                        post_files: data.post_files,
                        author_id: profile.id,
                        path: `apply/${data.application_id}/actions/${res.data.id}`,
                    })
                    // supabase DB保存
                    await postActionAttachments(
                        uploadedFiles,
                        res.data.id,
                        profile.id
                    )
                    toast.success("決裁しました");
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
            case "approve": {
                return { label: "承認", color: "success" };
            }
            case "reject": {
                return { label: "否認", color: "error" };
            }
            case "return": {
                return { label: "差し戻し", color: "warning" };
            }
        }
    };

    const can = useMemo(() => {
        if (!["pending", "return"].includes(approvalOrder.status.code)) return false; // 決裁中、差し戻し中以外は不可
        if (user?.is_admin) return true;
        return approvalOrder.approver_user_id === profile?.id;
    }, [user, profile, approvalOrder]);
    if( !can ) return null;

    return (
        <Box>
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

                            <FileInputField
                                name="post_files"
                                label="添付ファイルをアップロード"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                maxFiles={5}
                                maxSizeMB={10}
                                canDrop={false}
                            />

                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                spacing={1}
                                >
                                <Button
                                    type="submit"
                                    onClick={() => methods.setValue("action", "approve")}
                                    variant="contained"
                                    className={`bg-gradient-to-br from-success-dark via-success-main to-success-light`}
                                    disabled={watchingComment?.length === 0 || methods.formState.isSubmitting}
                                    loading={pending}
                                    loadingPosition="start"
                                    >
                                    承認
                                </Button>
                                <Button
                                    type="submit"
                                    onClick={() => methods.setValue("action", "reject")}
                                    variant="contained"
                                    className={`bg-gradient-to-br from-error-dark via-error-main to-error-light`}
                                    disabled={watchingComment?.length === 0 || methods.formState.isSubmitting}
                                    loading={pending}
                                    loadingPosition="start"
                                    >
                                    否認
                                </Button>
                                <Button
                                    type="submit"
                                    onClick={() => methods.setValue("action", "return")}
                                    variant="contained"
                                    className={`bg-gradient-to-br from-warning-dark via-warning-main to-warning-light`}
                                    disabled={watchingComment?.length === 0 || methods.formState.isSubmitting}
                                    loading={pending}
                                    loadingPosition="start"
                                    >
                                    差し戻し
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
        </Box>
    );
}
