"use client";

import {
    Box,
    Button,
    Container,
    Stack,
} from "@mui/material";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useTransition, useMemo } from "react";

import {
    masterStatusUpsertSchema,
    masterStatusUpdatePayloadSchema,
    type MasterStatusUpsertInput,
    type MasterStatusUpdateInput,
    isUpdateInput,
} from '@/schemas/approval/masterStatusSchema';
import { MasterStatusType } from '@/schemas/approval/masterStatusSchema';
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import DateRangeField from "@ui/form/DateRangeField";
import NumberInputField from "@ui/form/NumberInputField";

import { createMasterStatus, updateMasterStatus } from "@/lib/actions/approval/masterStatus";

export default function FormMasterStatus({
    editValues,
    onSubmitted,
    onClose,
}: {
    editValues?: MasterStatusType
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : undefined;

    const baseDefaults = useMemo<MasterStatusUpsertInput>(() => ({
        name: "",
        code: "",
        sort_order: 1,
        color: "primary",
        remarks: "",
        valid_at: new Date("2025-01-01"),
        invalid_at: new Date("2050-12-31"),
    }), []);

    const normalizedEdit: MasterStatusUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            valid_at: toDateOrUndefined((editValues as MasterStatusUpdateInput).valid_at),
            invalid_at: toDateOrUndefined((editValues as MasterStatusUpdateInput).invalid_at),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<MasterStatusUpsertInput>({
        resolver: zodResolver(masterStatusUpsertSchema),
        defaultValues: baseDefaults,
        mode: "onBlur",
    });

    // ← editValues が来たらここで反映（defaultValues では更新されないため）
    useEffect(() => {
        if (normalizedEdit) {
            methods.reset(normalizedEdit);
        } else {
            methods.reset(baseDefaults);
        }
    }, [normalizedEdit, methods, baseDefaults]);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<MasterStatusUpsertInput | null>(null);
    const handleConfirmSubmit = () => {
        const data = methods.getValues();
        setFormData(data);
        setConfirmOpen(true);
    };
    const handleSubmit = async () => {
        if (!formData) return;
        await onSubmit(formData);
        setConfirmOpen(false);
    };

    const [pending, start] = useTransition();

    const onSubmit = async (data: MasterStatusUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, ...rest } = data;
                    // 型/値検証（任意だが安全）
                    const payload = masterStatusUpdatePayloadSchema.parse(rest);
                    const res = await updateMasterStatus(id, payload);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("更新しました");
                } else {
                    const res = await createMasterStatus(data);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("作成しました");
                }
                onSubmitted();
                methods.reset();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : `${isUpdate ? "更新" : "作成"}に失敗しました`);
                onClose();
            }
        });
    };

    return (
        <Container maxWidth="lg">
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleConfirmSubmit)}>
                    <Stack spacing={3}>

                        <TextInputField
                            name="name"
                            label="名前"
                            />

                        <TextInputField
                            name="code"
                            label="コード"
                            />

                        <NumberInputField
                            name="sort_order"
                            label="表示順"
                            />

                        <TextInputField
                            name="color"
                            label="カラー"
                            />

                        <TextInputField
                            name="remarks"
                            label="備考"
                            />

                        <DateRangeField
                            fromName="valid_at"
                            toName="invalid_at"
                            labelStart="有効期限開始日"
                            labelEnd="有効期限終了日"
                            />

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 4,
                            }}
                            >
                            <Button
                                type="submit"
                                variant="contained"
                                color={isUpdate ? "warning" : "primary"}
                                fullWidth
                                disabled={methods.formState.isSubmitting}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "1.2em",
                                    py: 1
                                }}
                                loading={pending}
                                loadingPosition="start"
                                >
                                {isUpdate ? "編集" : "作成"}する
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </FormProvider>

            <DialogConfirm
                isOpen={confirmOpen}
                onDone={handleSubmit}
                onCancel={() => setConfirmOpen(false)}
                text={`マスタを${isUpdate ? "更新" : "作成"}しますか?`}
                okText={`${isUpdate ? "更新" : "作成"}する`}
                color={isUpdate ? "warning" : "primary"}
                />
        </Container>
    );
}
