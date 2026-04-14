"use client";

import {
    Box,
    Button,
    Chip,
    Container,
    Stack,
    Paper,
    Typography,
} from "@mui/material";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import {
    useForm,
    FormProvider,
    type DefaultValues,
    type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useMemo, useTransition } from "react";

import { toast } from "react-toastify";
import { addYears, addMonths } from "date-fns";

import {
    ApprovalCreateWithRevisionInput,
    approvalWithRevisionCreateSchema,
    approvalWithRevisionUpdateSchema,
    ApprovalUpdateInput,
} from "@/schemas/approval/approvalSchema";
import { ApprovalRevisionType } from "@/schemas/approval/approvalRevisionSchema";
import { AttachmentType, AttachmentCreateInput } from "@/schemas/approval/attachmentSchema";
import { ApprovalDraftType } from "@/schemas/approval/approvalDraftSchema";

import { getApprovalRevisionById } from "@/lib/actions/approval/approvalRevision";
import { upsertApproval } from "@/services/approval/approvalService";

import { uploadFiles } from "@/lib/cloudflare/storage/r2.client";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import NumberInputField from "@ui/form/NumberInputField";
import TextareaInputField from "@ui/form/TextareaInputField";
import DateRangeField from "@ui/form/DateRangeField";
import FileInputField from "@ui/form/FileInputField";
import UploadedFileList from "@ui/form/file/UploadedFileList";
import ApprovalDraftButton from "@/components/approval/buttons/ApprovalDraftButton";
import ApprovalDraftDialog from "@/components/approval/dialogs/ApprovalDraftDialog";

export default function ApprovalForm({
    approvalItem,
    onSuccess,
    registerReset,
}: {
    approvalItem?: ApprovalUpdateInput;
    onSuccess?: () => void;
    registerReset?: (fn: () => void) => void;
}) {
    const router = useRouter();
    const { profile } = useAuth();

    const [isEdit] = useState(approvalItem != undefined);
    const color = isEdit ? "warning" : "primary";

    const baseDefaults = useMemo<DefaultValues<ApprovalCreateWithRevisionInput>>(
        () => ({
            author_id: profile?.id || "",
            author_name_snapshot: profile?.name || "",
            department_id: profile?.department.id || "",
            department_name_snapshot: profile?.department.name || "",
            title: "",

            budget: 0,
            depreciation_period_months: 0,
            depreciation_amount: 0,
            start_date: new Date(),
            end_date: addYears(new Date(), 1),
            billing_date: new Date(),
            payment_date: addMonths(new Date(), 1),

            post_files: [],
        }),
        [profile],
    );

    const methods = useForm<ApprovalCreateWithRevisionInput>({
        resolver: zodResolver(approvalWithRevisionCreateSchema),
        defaultValues: baseDefaults,
        mode: "onBlur",
    });

    useEffect(() => {
        registerReset?.(() => methods.reset());
    }, [registerReset, methods]);

    const [currentRevision, setCurrentRevision] = useState({} as ApprovalRevisionType);
    const [normalizedEdit, setNormalizedEdit] =
        useState<DefaultValues<ApprovalCreateWithRevisionInput>>(baseDefaults);

    useEffect(() => {
        const {
            budget,
            depreciation_period_months,
            depreciation_amount,
            details,
            start_date,
            end_date,
            billing_date,
            payment_date,
        } = currentRevision;

        // リビジョン登録につきisEditでも同様の処理
        const { id: _id, ...rest } = approvalItem ?? {};

        setNormalizedEdit({
            ...baseDefaults,
            ...(rest as any),
            budget: budget ?? 0,
            details: details ?? "",
            depreciation_period_months: depreciation_period_months ?? 0,
            depreciation_amount: depreciation_amount ?? 0,
            start_date: start_date ? new Date(start_date) : new Date(),
            end_date: end_date ? new Date(end_date) : addYears(new Date(), 1),
            billing_date: billing_date ? new Date(billing_date) : new Date(),
            payment_date: payment_date ? new Date(payment_date) : addMonths(new Date(), 1),
            post_files: [],
        });
    }, [baseDefaults, approvalItem, currentRevision, isEdit]);

    useEffect(() => {
        if (!isEdit) return;
        methods.reset(normalizedEdit);
    }, [isEdit, methods, normalizedEdit]);

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            if (!approvalItem?.current_revision_id) return;
            const currentRes = await getApprovalRevisionById(approvalItem.current_revision_id);
            if (!currentRes.ok) return;
            setCurrentRevision(currentRes.data);
        })();
    }, [isEdit, approvalItem]);

    // for Draft
    const [activeDraft, setActiveDraft] = useState<ApprovalDraftType | null>(null);
    // リビジョン/下書きの添付ファイル処理
    type FinalizeRes = { ok: true } | { ok: false; error: string };
    const finalizeDraftAttachments = async (
        files: AttachmentCreateInput[],
        current_revision_id: string,
    ): Promise<FinalizeRes> => {
        if (!profile) throw new Error("ユーザ情報の取得に失敗しました");

        const res = await fetch(`/api/approval/attachments/finalize`,
            {
                method: 'POST',
                body: JSON.stringify({
                    files,
                    current_revision_id,
                    profile_id: profile.id,
                    draft: activeDraft,
                    removedAttachmentIds: removedIds,
                }),
            })

        // サーバが落ちてHTML返す等に備えて try/catch
        let json: any = null;
        try { json = await res.json(); }
        catch { // json が読めない時はステータスで判断
        }

        if (!res.ok) { return { ok: false, error: json?.error ?? `finalize failed: ${res.status}` }; }
        if (!json?.ok) { return { ok: false, error: json?.error ?? "finalize failed" }; }

        setActiveDraft(null);
        return { ok: true };
    }

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<ApprovalCreateWithRevisionInput | null>(null);

    const handleConfirmSubmit: SubmitHandler<ApprovalCreateWithRevisionInput> = (data) => {
        setFormData(data);
        setConfirmOpen(true);
    };

    const handleConfirmedSubmit = async () => {
        if (!formData) return;
        await onSubmit(formData);
        setConfirmOpen(false);
    };

    const [pending, start] = useTransition();
    const [removedIds, setRemovedIds] = useState<string[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<AttachmentType[]>([]); // 例

    const onSubmit = async (data: ApprovalCreateWithRevisionInput) => {
        start(async () => {
            try {
                if (!profile) throw new Error("ユーザ情報の取得に失敗しました");

                // Next.js（App Router の Server Actions）はデフォルトで リクエストボディが 1MB 制限につき
                // ファイルそのものはserver componentに渡さないように。
                const { post_files, ...rest } = data;

                const payload = {
                    ...rest,
                    author_id: profile.id,
                    author_name_snapshot: profile.name,
                    department_id: profile.department.id,
                    department_name_snapshot: profile.department.name,

                    budget: data.budget ?? 0,
                    details: (data as any).details ?? "",
                    depreciation_period_months: data.depreciation_period_months ?? 0,
                    depreciation_amount: data.depreciation_amount ?? 0,
                    start_date: data.start_date ?? new Date(),
                    end_date: data.end_date ?? new Date(),
                    billing_date: data.billing_date ?? new Date(),
                    payment_date: data.payment_date ?? new Date(),
                };

                if (isEdit) {
                    // **** リビジョン登録
                    const res = await upsertApproval(
                        approvalWithRevisionUpdateSchema.parse({
                            ...payload,
                            id: approvalItem?.id,
                            current_revision_id: currentRevision.id,
                            removed_attachment_ids: removedIds,
                        }),
                    );
                    if (!res.ok) toast.error(res.error);
                    else {
                        if(res.data) {
                            // R2保存
                            const uploadedFiles = await uploadFiles({
                                post_files: data.post_files,
                                author_id: profile.id,
                                path: `approval/${approvalItem?.id}`,
                            })
                            if(res.data.current_revision_id) {
                                // 添付ファイル処理
                                const resFda = await finalizeDraftAttachments(
                                    uploadedFiles,
                                    res.data.current_revision_id,
                                )
                                if (!resFda.ok) {
                                    toast.error(resFda.error);
                                    return;
                                }
                            }
                        }
                        toast.success("改訂申請書を登録しました");
                        router.replace(`/approval/${approvalItem?.id}`);
                        setTimeout(() => {
                            start(() => {
                                onSuccess?.();
                                methods.reset();
                            });
                        }, 100);
                    }
                } else {
                    // **** 新規登録
                    const res = await upsertApproval(payload as any);
                    if (!res.ok) toast.error(res.error);
                    else if (res.data) {

                        const uploadedFiles = await uploadFiles({
                            post_files: post_files,
                            author_id: profile.id,
                            path: `approval/${res.data.id}`,
                        });
                        if(res.data.current_revision_id) {
                            // 添付ファイル処理
                            const resFda = await finalizeDraftAttachments(
                                uploadedFiles,
                                res.data.current_revision_id,
                            )
                            if (!resFda.ok) {
                                toast.error(resFda.error);
                                return;
                            }
                        }

                        toast.success("申請書を提出しました");
                        router.replace(`/approval/${res.data.id}`);

                        setTimeout(() => {
                            start(() => {
                                onSuccess?.();
                                methods.reset();
                            });
                        }, 100);
                    }
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "");
            }
        });
    };

    const secItem = (title: string, value: string) => (
        <Stack direction="row" spacing={1}>
            <Chip label={title} size="small" component={"span"} />
            <Typography variant="body1" gutterBottom>
                {value}
            </Typography>
        </Stack>
    );

    if (methods.formState.isLoading) return null;

    return (
        <Container maxWidth="xl">
            <Stack direction="row" justifyContent="end" alignItems="center" mb={1}>
                <ApprovalDraftDialog
                    isEdit={isEdit}
                    methods={methods}
                    baseDefaults={baseDefaults}
                    activeDraft={activeDraft}
                    setActiveDraft={setActiveDraft}
                    setDraftAttachments={(atts) => setExistingAttachments(atts)}
                    />
            </Stack>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleConfirmSubmit)}>
                        <Stack spacing={3}>
                            {secItem("投稿者", methods.getValues("author_name_snapshot") ?? "")}
                            {secItem("部門", methods.getValues("department_name_snapshot") ?? "")}

                            {isEdit ? (
                                secItem("タイトル", methods.getValues("title") ?? "")
                            ) : (
                                <TextInputField name="title" label="タイトル" required />
                            )}

                            <NumberInputField name="budget" label="予算" min={0} />
                            <TextareaInputField name="details" label="本文" minRows={10} required />

                            <Stack direction="row" spacing={2}>
                                <NumberInputField name="depreciation_period_months" label="減価償却期間(年)" min={0} />
                                <NumberInputField name="depreciation_amount" label="償却額(円/月)" min={0} />
                            </Stack>

                            <FileInputField
                                name="post_files"
                                label="添付ファイルをアップロード"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                maxFiles={5}
                                maxSizeMB={10}
                            />

                            {existingAttachments.length > 0 && (
                                <UploadedFileList
                                    attachments={existingAttachments}
                                    onRemove={(id) => {
                                        setRemovedIds((prev) => [...prev, id]);
                                        setExistingAttachments((prev) => prev.filter((x) => x.id !== id));
                                    }}
                                    fetchUrl={"/api/approval/attachments/signed-urls"}
                                    canRemove={true}
                                />
                            )}

                            <DateRangeField fromName="start_date" toName="end_date" labelStart="実施予定日" labelEnd="完了予定日" />
                            <DateRangeField
                                fromName="billing_date"
                                toName="payment_date"
                                labelStart="請求予定月"
                                labelEnd="支払予定月"
                                granularity="month"
                            />

                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                                {!isEdit &&
                                    <ApprovalDraftButton
                                        activeDraft={activeDraft}
                                        pending={pending}
                                        methods={methods}
                                        removedIds={removedIds}
                                        onSuccess={onSuccess}
                                        />
                                }
                                <Button
                                    type="submit"
                                    variant="contained"
                                    className={`bg-gradient-to-br from-${color}-dark via-${color}-main to-${color}-light`}
                                    fullWidth
                                    size="large"
                                    disabled={methods.formState.isSubmitting}
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "1.4em",
                                        py: 2
                                    }}
                                    loading={pending}
                                    loadingPosition="start"
                                >
                                    {isEdit && "改訂版を"}登録する
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </FormProvider>
            </Paper>

            <DialogConfirm
                isOpen={confirmOpen}
                onDone={handleConfirmedSubmit}
                onCancel={() => setConfirmOpen(false)}
                text={`問い合わせ情報を${isEdit ? "更新" : "登録"}しますか?`}
                okText={`${isEdit ? "更新" : "登録"}する`}
                color={color}
            />

        </Container>
    );
}
