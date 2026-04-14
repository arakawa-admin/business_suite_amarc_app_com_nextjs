"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { DeleteActionButton } from "@/components/common/buttons/DeleteActionButton";

import { ApplicationWithRevisionsType } from "@/schemas/apply/applicationSchema";

import { ApplicationDeleteDialog } from "@/components/apply/dialogs/ApplicationDeleteDialogs";

// 1) 申請書取り下げ(削除)
export function ApplicationDeleteButton({
    application,
}: {
    application: ApplicationWithRevisionsType;
}) {
    const { user, profile } = useAuth();

    const can = useMemo(() => {
        if (application.status.code !== "pending") return false; // 決裁中以外は削除不可
        if (user?.is_admin) return true;
        return application.author_id === profile?.id;
    }, [user, profile, application]);

    return (
        <DeleteActionButton
            title="取下げ"
            can={can}
            renderDialog={({ open, onClose }) => (
                <ApplicationDeleteDialog
                    application={application}
                    open={open}
                    onClose={onClose}
                    />
            )}
        />
    );
}

