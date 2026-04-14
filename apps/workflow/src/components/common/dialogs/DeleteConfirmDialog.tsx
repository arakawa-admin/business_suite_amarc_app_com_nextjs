"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import { FetchResult } from "@/types/fetch-result";

export function DeleteConfirmDialog({
    open,
    onClose,
    title,
    text = "削除すると元に戻せません。",
    okText = "削除する",
    successMessage,
    errorMessage,
    doDelete,
    redirect, // 必要なら遷移先を返す
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    text?: string;
    okText?: string;
    successMessage: string;
    errorMessage: string;
    doDelete: () => Promise<FetchResult<void>>;
    redirect?: (ctx: { hasId: boolean }) => string | null | undefined;
}) {
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const hasId = Boolean(params?.id);

    const handleDone = async () => {
        try {
            await doDelete();
            toast.success(successMessage);

            if (hasId) {
                const to = redirect?.({ hasId });
                if (to) router.replace(to);
            }
        } catch {
            toast.error(errorMessage);
        } finally {
            onClose();
        }
    };

    return (
        <DialogConfirm
            isOpen={open}
            onDone={handleDone}
            onCancel={onClose}
            title={title}
            text={text}
            okText={okText}
            color="error"
        />
    );
}
