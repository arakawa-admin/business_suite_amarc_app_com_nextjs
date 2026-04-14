"use client";

import {
    Box,
    Button,
    Container,
    Stack,
} from "@mui/material";

import { useForm, FormProvider,
    // useWatch
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useTransition, useMemo } from "react";

import {
    applyFormCreateSchema,
    applyFormUpdateSchema,
    // applyFormUpsertSchema,
    // applyFormUpdatePayloadSchema,
    type ApplyFormUpsertInput,
    type ApplyFormUpdateInput,
    type ApplyFormType,
    isUpdateInput,
} from '@/schemas/apply/applyFormSchema';
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
// import TextareaInputField from "@ui/form/TextareaInputField";
import DateRangeField from "@ui/form/DateRangeField";
import NumberInputField from "@ui/form/NumberInputField";
import ApplyFormCategorySelectField from "@/components/form/apply/ApplyFormCategorySelectField";

import { createApplyForm, updateApplyForm } from "@/lib/actions/apply/applyForm";

export default function FormApplyForm({
    editValues,
    onSubmitted,
    onClose,
}: {
    editValues?: ApplyFormType
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : undefined;

    const baseDefaults = useMemo<ApplyFormUpsertInput>(() => ({
        name: "",
        code: "",
        category_id: "",
        description: "",
        // schema: "{}",
        sort_order: 1,
        valid_at: new Date("2025-01-01"),
        invalid_at: new Date("2050-12-31"),
    }), []);

    const normalizedEdit: ApplyFormUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            // // DBから来たオブジェクトを文字列に変換（フォーム表示用）
            // schema: editValues.schema
            //     ? JSON.stringify(editValues.schema, null, 2)
            //     : "{}", // 空なら {}
            valid_at: toDateOrUndefined((editValues as ApplyFormUpdateInput).valid_at),
            invalid_at: toDateOrUndefined((editValues as ApplyFormUpdateInput).invalid_at),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<ApplyFormUpsertInput>({
        resolver: zodResolver(
            isUpdate ? applyFormUpdateSchema : applyFormCreateSchema
        ),
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
    const [formData, setFormData] = useState<ApplyFormUpsertInput | null>(null);
    const handleConfirmSubmit = (data: ApplyFormUpsertInput) => {
        setFormData(data);
        setConfirmOpen(true);
    };
    const handleSubmit = async () => {
        if (!formData) return;
        await onSubmit(formData);
        setConfirmOpen(false);
    };

    const [pending, start] = useTransition();

    const onSubmit = async (data: ApplyFormUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, ...rest } = data;
                    const res = await updateApplyForm(id, rest);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("更新しました");
                } else {
                    const res = await createApplyForm(data);
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

                        <ApplyFormCategorySelectField
                            name="category_id"
                            label="申請カテゴリ"
                            />

                        <NumberInputField
                            name="sort_order"
                            label="表示順"
                            />

                        <TextInputField
                            name="name"
                            label="申請フォーム名"
                            />

                        <TextInputField
                            name="code"
                            label="コード"
                            />

                        <TextInputField
                            name="description"
                            label="説明"
                            />

                        {/* <TextareaInputField
                            name="schema"
                            label="スキーマ"
                            minRows={8}
                            /> */}

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
