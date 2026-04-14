"use client";

import {
    Box,
    Button,
    Container,
    Stack,
} from "@mui/material";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useTransition, useMemo } from "react";

import {
    masterFormApproverUpsertSchema,
    masterFormApproverUpdatePayloadSchema,
    type MasterFormApproverUpsertInput,
    type MasterFormApproverUpdateInput,
    isUpdateInput,
} from '@/schemas/apply/masterFormApproverSchema';
import { MasterFormApproverType } from '@/schemas/apply/masterFormApproverSchema';
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import DateRangeField from "@ui/form/DateRangeField";
import DepartmentSelectField from "@ui/form/DepartmentSelectField";
import StaffSelectField from "@ui/form/StaffSelectField";
import NumberInputField from "@ui/form/NumberInputField";

import { createMasterFormApprover, updateMasterFormApprover } from "@/lib/actions/apply/masterFormApprover";

export default function FormMasterFormApprover({
    masters,
    editValues,
    onSubmitted,
    onClose,
}: {
    masters: MasterFormApproverType[]|undefined
    editValues?: MasterFormApproverType
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : undefined;

    const baseDefaults = useMemo<MasterFormApproverUpsertInput>(() => ({
        department_id: "",
        apply_form_id: "",
        sequence: 1,
        approver_user_id: "",
        description: "",
        valid_at: new Date("2025-01-01"),
        invalid_at: new Date("2050-12-31"),
    }), []);

    const normalizedEdit: MasterFormApproverUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            // todo
            // department_ids: editValues.memberships.map((m) => m.department.id) ?? "",
            // approver_user_id: editValues.memberships.map((m) => m.department.id) ?? "",
            valid_at: toDateOrUndefined((editValues as MasterFormApproverUpdateInput).valid_at),
            invalid_at: toDateOrUndefined((editValues as MasterFormApproverUpdateInput).invalid_at),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<MasterFormApproverUpsertInput>({
        resolver: zodResolver(masterFormApproverUpsertSchema),
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

    // ↓↓↓ sequence を部門IDに基づき重複を防ぐ ↓↓↓ //
    const watchingDepartmentId = useWatch({
        control: methods.control,
        name: "department_id",
    });
    const { minSeq, nextSeq } = useMemo(() => {
        if (!masters?.length || !watchingDepartmentId) return { minSeq: 1, nextSeq: 1 };
        const list = masters.filter(m => m.department_id === watchingDepartmentId);
        if (list.length === 0) return { minSeq: 1, nextSeq: 1 };

        const seqs = list.map(m => m.sequence).filter((n): n is number => typeof n === "number");

        const minSeq = Math.min(...seqs);
        // const maxSeq = Math.max(...seqs);

        return { minSeq, nextSeq: 1 + minSeq };
    }, [masters, watchingDepartmentId]);
    useEffect(() => {
        methods.setValue("sequence", nextSeq);
    }, [nextSeq, methods]);
    const validateSequenceByDepartment = (values: MasterFormApproverUpsertInput) => {
        if (!masters?.length || !values.department_id || !values.sequence) return true;

        const list = masters.filter(m => m.department_id === values.department_id);
        const minSeq = list.length ? Math.min(...list.map(m => m.sequence)) : 1;

        if (values.sequence < minSeq+1) {
            methods.setError("sequence", { type: "manual", message: `${minSeq}まで登録されていますので、${minSeq+1}以上で入力してください` });
            return false;
        }
        return true;
    };
    // ↑↑↑ sequence を部門IDに基づき重複を防ぐ ↑↑↑ //


    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<MasterFormApproverUpsertInput | null>(null);
    const handleConfirmSubmit = () => {
        const data = methods.getValues();
        if (!validateSequenceByDepartment(data)) return;

        setFormData(data);
        setConfirmOpen(true);
    };
    const handleSubmit = async () => {
        if (!formData) return;
        await onSubmit(formData);
        setConfirmOpen(false);
    };

    const [pending, start] = useTransition();

    const onSubmit = async (data: MasterFormApproverUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, ...rest } = data;
                    // 型/値検証（任意だが安全）
                    const payload = masterFormApproverUpdatePayloadSchema.parse(rest);
                    const res = await updateMasterFormApprover(id, payload);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("更新しました");
                } else {
                    const res = await createMasterFormApprover(data);
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
                            name="approver_user_id"
                            label="承認者"
                            nonDefault={true}
                            />

                        <NumberInputField
                            name="sequence"
                            label="承認順"
                            min={minSeq}
                            />

                        <TextInputField
                            name="description"
                            label="説明"
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
