"use client";
import { useState, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import {
    Button,
    Box,
    Dialog,
    Toolbar,
    Typography,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    DialogActions,
} from "@mui/material";

import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import DrawIcon from '@mui/icons-material/Draw';

import { ApprovalDraftType } from "@/schemas/approval/approvalDraftSchema";
import { AttachmentType } from "@/schemas/approval/attachmentSchema";

import { getApprovalDraftsByOwnerId } from "@/lib/actions/approval/approvalDraft";

import DialogConfirm from '@/components/common/dialogs/DialogConfirm';

const toDate = (v: unknown) => {
    if (!v) return undefined;
    if (v instanceof Date) return v;
    if (typeof v === "string" || typeof v === "number") {
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
};

export default function ApprovalDraftDialog({
    isEdit,
    methods,
    baseDefaults,
    activeDraft,
    setActiveDraft,
    setDraftAttachments,
}: {
    isEdit: boolean;
    methods: any;
    baseDefaults: any;
    activeDraft: ApprovalDraftType | null;
    setActiveDraft: (draft: ApprovalDraftType | null) => void;
    setDraftAttachments: (files: AttachmentType[] | []) => void;
}) {
    const { profile } = useAuth();

    // =====================
    // 下書き機能（新規のときだけ有効化推奨）
    // =====================
    const enableDraft = !isEdit; // ←稟議の編集画面で下書きを使いたいなら true にしてOK

    const [draftDialogOpen, setDraftDialogOpen] = useState(false);

    const [drafts, setDrafts] = useState<ApprovalDraftType[]>([]);

    const [deleteItem, setDeleteItem] = useState({} as ApprovalDraftType);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const handleDelete = (draft: ApprovalDraftType) => {
        setDeleteItem(draft);
        setConfirmOpen(true);
    }
    const cancelDelete = () => {
        setDeleteItem({} as ApprovalDraftType);
        setConfirmOpen(false);
    }

    // 一覧ロード
    const loadDrafts = async () => {
        if (!profile) return;
        const res = await getApprovalDraftsByOwnerId(profile?.id);
        if (!res.ok) {
            toast.error("下書き一覧の取得に失敗しました");
            return;
        }
        setDrafts(res.data ?? []);
    };

    useEffect(() => {
        if (!enableDraft) return;
        loadDrafts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableDraft, profile?.id]);

    // 下書きセット
    const setDraft = async (draftId: string) => {
        const draft = drafts.find((d) => d.id === draftId);
        if (!draft) return;
        const normalizeDraftPayload = (p: any) => ({
            ...p,
            start_date: toDate(p?.start_date) ?? baseDefaults.start_date,
            end_date: toDate(p?.end_date) ?? baseDefaults.end_date,
            billing_date: toDate(p?.billing_date) ?? baseDefaults.billing_date,
            payment_date: toDate(p?.payment_date) ?? baseDefaults.payment_date,
        });
        const merged = {
            ...baseDefaults,
            ...normalizeDraftPayload(draft.payload),
        };
        const draft_attachments = (draft.draft_attachments ?? [])
                                .map((x) => x.attachment)
                                .filter((x): x is AttachmentType => x != null);
        setDraftAttachments(draft_attachments);
        setActiveDraft(draft);
        methods.reset(merged);
    };

    // 下書き削除
    const deleteDraft = async () => {
        await fetch(`/api/approval/draft/${deleteItem.id}/delete`, { method: 'DELETE' })
            .then((res) => res.json())
            .then((res) => {
                if (!res.ok) {
                    toast.error("下書き削除に失敗しました");
                    return;
                }
            })
        if (activeDraft?.id === deleteItem.id) {
            setActiveDraft(null);
        }
        toast.success("下書きを削除しました");
        setConfirmOpen(false);

        setTimeout(() => {
            (async () => await loadDrafts())();
        }, 500);
    };

    return (
        <Box>
            <Button
                variant="text"
                onClick={() => setDraftDialogOpen(true)}
                >
                下書き一覧
            </Button>
            <Dialog open={draftDialogOpen} onClose={() => setDraftDialogOpen(false)} fullWidth maxWidth="md">
                <Toolbar
                    variant="dense"
                    sx={{
                        backgroundColor: "info.main",
                        color: "info.contrastText",
                        fontWeight: "bold",
                    }}
                    >
                    <Typography sx={{ flexGrow: 1 }}>
                        下書き一覧
                    </Typography>
                    <Button
                        onClick={() => loadDrafts()}
                        size="small"
                        color="info"
                        sx={{
                            backgroundColor: "white",
                        }}
                        endIcon={ <ReplayIcon /> }
                        >
                        更新
                    </Button>
                </Toolbar>
                <DialogContent dividers>
                    <List dense>
                        {drafts.map((d) => (
                            <ListItem
                                key={d.id}
                                secondaryAction={
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(d)}
                                        startIcon={<DeleteIcon />}
                                        >
                                        削除
                                    </Button>
                                }
                                >
                                <ListItemButton
                                    onClick={() => {
                                        setDraftDialogOpen(false);
                                        setDraft(d.id);
                                    }}
                                    >
                                    <ListItemAvatar>
                                        <Avatar>
                                            <DrawIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${d.payload.title ?? "無題"}`}
                                        secondary={`${format(d.updated_at, "yyyy/MM/dd HH:mm", { locale: ja })}`}
                                        sx={{
                                            ".MuiListItemText-primary" : {
                                                fontWeight: "bold",
                                                fontSize: "1.1em"
                                            }
                                        }}
                                    />
                                </ListItemButton>
                                <Divider />
                            </ListItem>
                        ))}
                        {drafts.length === 0 && (
                            <Typography variant="body2" sx={{ color: "text.secondary", p: 1 }}>
                                下書きはありません
                            </Typography>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDraftDialogOpen(false)}>閉じる</Button>
                </DialogActions>
            </Dialog>

            <DialogConfirm
                isOpen={confirmOpen}
                onCancel={cancelDelete}
                onDone={deleteDraft}
                text="下書きを削除していいですか？"
                color = "error"
                okText="削除する"
                />
        </Box>
    )
}
