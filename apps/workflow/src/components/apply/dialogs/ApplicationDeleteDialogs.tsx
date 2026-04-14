"use client";

import { DeleteConfirmDialog } from "@/components/common/dialogs/DeleteConfirmDialog";

import { cancelApplication } from "@/services/apply/applicationService";
import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";

// 1) 申請書取り下げ(削除)
export function ApplicationDeleteDialog({
    application,
    open,
    onClose,
}: {
    application: ApplicationWithRevisionsType;
    open: boolean;
    onClose: () => void;
}) {
    return (
        <DeleteConfirmDialog
            open={open}
            onClose={onClose}
            okText="取り下げる"
            text = "取り下げると元に戻せません。"
            title={`申請書を取り下げますか?`}
            successMessage="申請書を取り下げました"
            errorMessage="申請書を取り下げに失敗しました"
            doDelete={() => cancelApplication(application.id)}
        />
    );
}
