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
    masterStaffUpsertSchema,
    masterStaffUpdatePayloadSchema,
    type MasterStaffUpsertInput,
    type MasterStaffUpdateInput,
    isUpdateInput,
} from "@/schemas/common/masterStaffSchema";
import { StaffDepartmentWithDepartmentType } from "@/schemas/common/staffDepartmentSchema";
type MasterStaffWithDepartmentsUpdateInput = MasterStaffUpdateInput & {
    memberships: StaffDepartmentWithDepartmentType[]
}
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import TextInputField from "@ui/form/TextInputField";
import DateRangeField from "@ui/form/DateRangeField";
import LoginUserSelectField from "@ui/form/LoginUserSelectField";
import DepartmentSelectField from "@ui/form/DepartmentSelectField";

import { createMasterStaff, updateMasterStaff } from "@/lib/actions/common/masterStaff";
import { createStaffDepartment, updateStaffAndDepartments } from "@/lib/actions/common/staffDepartment";

export default function FormMasterStaff({
    editValues,
    onSubmitted,
    onClose,
}: {
    editValues?: MasterStaffWithDepartmentsUpdateInput
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : undefined;

    const baseDefaults = useMemo<MasterStaffUpsertInput>(() => ({
        login_user_id: "",
        name: "",
        kana: "",
        remarks: "",
        valid_at: new Date("2025-01-01"),
        invalid_at: new Date("2050-12-31"),
        department_ids: [],
    }), []);

    const normalizedEdit: MasterStaffUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            department_ids: editValues.memberships.map((m) => m.department.id) ?? "",
            valid_at: toDateOrUndefined((editValues as MasterStaffUpdateInput).valid_at),
            invalid_at: toDateOrUndefined((editValues as MasterStaffUpdateInput).invalid_at),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<MasterStaffUpsertInput>({
        resolver: zodResolver(masterStaffUpsertSchema),
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
    const [formData, setFormData] = useState<MasterStaffUpsertInput | null>(null);
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

    const onSubmit = async (data: MasterStaffUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, department_ids, ...rest } = data;
                    // 型/値検証（任意だが安全）
                    const payload = masterStaffUpdatePayloadSchema.parse(rest);
                    const res = await updateMasterStaff(id, payload);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    if (res.ok && department_ids) {
                        await updateStaffAndDepartments(res.data.id, department_ids);
                    }
                    toast.success("更新しました");
                } else {
                    const { department_ids, ...rest } = data;
                    const res = await createMasterStaff(rest);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    if (res.ok && department_ids) {
                        await Promise.all(
                            department_ids?.map(async (deptId) => {
                                await createStaffDepartment({
                                    staff_id: res.data.id,
                                    department_id: deptId
                                });
                            })
                        );
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
                            name="kana"
                            label="カナ"
                            />

                        <LoginUserSelectField
                            name="login_user_id"
                            label="ログインユーザ"
                            />

                        <DepartmentSelectField
                            name="department_ids"
                            label="所属部門"
                            multiple
                            showChips
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
