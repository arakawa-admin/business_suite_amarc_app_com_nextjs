"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

import { Button } from "@mui/material";

import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import { createApprovalDraft, updateApprovalDraft } from "@/lib/actions/approval/approvalDraft";
import { postDraftAttachments } from "@/services/approval/approvalAttachmentService";
import { deleteDraftAttachment } from "@/services/approval/approvalDraftService";

import { ApprovalDraftType } from "@/schemas/approval/approvalDraftSchema";

import DialogConfirm from '@/components/common/dialogs/DialogConfirm';

// draft payload = フォーム値から File を抜いたもの
import { ApprovalCreateWithRevisionInput } from "@/schemas/approval/approvalSchema";
type ApprovalDraftPayload = Omit<ApprovalCreateWithRevisionInput, "post_files">;
function stripFiles(v: ApprovalCreateWithRevisionInput): ApprovalDraftPayload {
    // post_files は payload に入れない
    const { post_files: _post_files, ...rest } = v as any;
    return rest;
}

export default function ApprovalDraftButton({
    activeDraft,
    pending,
    methods,
    removedIds,
    onSuccess,
}: {
    activeDraft: ApprovalDraftType | null;
    pending: boolean;
    methods: any;
    removedIds: string[];
    onSuccess?: () => void;
}) {
    const { profile } = useAuth();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const handlePost = () => {
        setConfirmOpen(true);
    }
    const cancelPost = () => {
        setConfirmOpen(false);
    }

    const saveDraft = async () => {
        if (!profile) throw new Error("ユーザ情報の取得に失敗しました");

        const values = methods.getValues();
        const payload = stripFiles(values);

        // update
        if (activeDraft) {
            const res = await updateApprovalDraft(activeDraft.id, {
                owner_user_id: profile.id,
                payload,
                version: activeDraft.version+1,
            });
            if (!res.ok) throw new Error("下書き更新に失敗しました");

            else {
                const postFiles = methods.getValues("post_files")
                if(res.data && postFiles.length > 0){
                    // R2保存
                    const uploadedFiles = await uploadFiles({
                        post_files: postFiles,
                        author_id: profile.id,
                        path: `approval/${res.data?.id}`,
                    })
                    // supabase DB保存
                    await postDraftAttachments(
                        uploadedFiles,
                        res.data.id,
                        profile.id
                    );
                }
                removedIds.map((id) => {
                    (async () => {
                        const { ok, error: delAttachmentErr } = await deleteDraftAttachment(id)
                        if (!ok) throw new Error(delAttachmentErr);
                    })();
                });
            }

            toast.success("下書きを更新しました");
        }
        else {
            // create
            const res = await createApprovalDraft({
                owner_user_id: profile.id,
                payload,
                version: 1,
            });
            if (!res.ok) throw new Error("下書き作成に失敗しました");
            else {
                const postFiles = methods.getValues("post_files")
                if(res.data && postFiles.length > 0){
                    // R2保存
                    const uploadedFiles = await uploadFiles({
                        post_files: postFiles,
                        author_id: profile.id,
                        path: `approval/${res.data?.id}`,
                    })
                    // supabase DB保存
                    await postDraftAttachments(
                        uploadedFiles,
                        res.data.id,
                        profile.id
                    );
                }
            }

            toast.success("下書きを保存しました");
        }
        setTimeout(() => {
            onSuccess?.();
            setConfirmOpen(false);
            methods.reset();
        }, 100);
    };

    return (
        <>
            <Button
                variant="outlined"
                color="inherit"
                fullWidth
                disabled={methods.formState.isSubmitting}
                loading={pending}
                sx={{ mr: 1 }}
                size="large"
                onClick={() => handlePost()}
                >
                下書き保存
            </Button>

            <DialogConfirm
                isOpen={confirmOpen}
                onCancel={cancelPost}
                onDone={saveDraft}
                text="下書きを保存しますか？"
                color = "info"
                okText="保存する"
                />
        </>
    );
}
