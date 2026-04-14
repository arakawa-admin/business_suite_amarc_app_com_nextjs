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
    masterDepartmentReviewerUpsertSchema,
    masterDepartmentReviewerUpdatePayloadSchema,
    type MasterDepartmentReviewerUpsertInput,
    type MasterDepartmentReviewerUpdateInput,
    isUpdateInput,
} from '@/schemas/approval/masterDepartmentReviewerSchema';
import { MasterDepartmentReviewerType } from '@/schemas/approval/masterDepartmentReviewerSchema';
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import DateRangeField from "@ui/form/DateRangeField";
import DepartmentSelectField from "@ui/form/DepartmentSelectField";
import StaffSelectField from "@ui/form/StaffSelectField";

import { createMasterDepartmentReviewer, updateMasterDepartmentReviewer } from "@/lib/actions/approval/masterDepartmentReviewer";

export default function FormMasterDepartmentReviewer({
    editValues,
    onSubmitted,
    onClose,
}: {
    masters: MasterDepartmentReviewerType[]|undefined
    editValues?: MasterDepartmentReviewerType
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : undefined;

    const baseDefaults = useMemo<MasterDepartmentReviewerUpsertInput>(() => ({
        department_id: "",
        reviewer_user_id: "",
        remarks: "",
        valid_at: new Date("2025-01-01"),
        invalid_at: new Date("2050-12-31"),
    }), []);

    const normalizedEdit: MasterDepartmentReviewerUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            // todo
            // department_ids: editValues.memberships.map((m) => m.department.id) ?? "",
            // reviewer_user_id: editValues.memberships.map((m) => m.department.id) ?? "",
            valid_at: toDateOrUndefined((editValues as MasterDepartmentReviewerUpdateInput).valid_at),
            invalid_at: toDateOrUndefined((editValues as MasterDepartmentReviewerUpdateInput).invalid_at),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<MasterDepartmentReviewerUpsertInput>({
        resolver: zodResolver(masterDepartmentReviewerUpsertSchema),
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
    const [formData, setFormData] = useState<MasterDepartmentReviewerUpsertInput | null>(null);
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

    const onSubmit = async (data: MasterDepartmentReviewerUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, ...rest } = data;
                    // 型/値検証（任意だが安全）
                    const payload = masterDepartmentReviewerUpdatePayloadSchema.parse(rest);
                    const res = await updateMasterDepartmentReviewer(id, payload);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("更新しました");
                } else {
                    const res = await createMasterDepartmentReviewer(data);
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
                        <DepartmentSelectField
                            name="department_id"
                            label="部門"
                            />

                        <StaffSelectField
                            name="reviewer_user_id"
                            label="回議者"
                            nonDefault={true}
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
