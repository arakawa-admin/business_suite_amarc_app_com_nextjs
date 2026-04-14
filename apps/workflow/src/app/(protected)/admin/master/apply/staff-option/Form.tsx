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
    masterStaffOptionUpsertSchema,
    masterStaffOptionUpdatePayloadSchema,
    type MasterStaffOptionUpsertInput,
    isUpdateInput,
} from '@/schemas/apply/masterStaffOptionSchema';
import { MasterStaffOptionType } from '@/schemas/apply/masterStaffOptionSchema';
import { toast } from "react-toastify";

import DialogConfirm from "@/components/common/dialogs/DialogConfirm";

import StaffSelectField from "@ui/form/StaffSelectField";
import DateRangeField from "@ui/form/DateRangeField";
import SelectDateField from "@ui/form/SelectDateField";
import EmployTypeSelectField from "@/components/form/apply/EmployTypeSelectField";

import { createMasterStaffOption, updateMasterStaffOption } from "@/lib/actions/apply/masterStaffOption";

export default function FormMasterStaffOption({
    masters,
    editValues,
    onSubmitted,
    onClose,
}: {
    masters: MasterStaffOptionType[]|undefined
    editValues?: MasterStaffOptionType
    onSubmitted: () => void
    onClose: () => void
}) {

    const isUpdate = !!(editValues && 'id' in editValues);

    // 文字列→Date に正規化
    const toDateOrUndefined = (v: unknown) =>
        v ? new Date(String(v)) : new Date();

    const baseDefaults = useMemo<MasterStaffOptionUpsertInput>(() => ({
        staff_id: "",
        birthday: new Date("2000-01-01"),
        employ_type_id: "",
        employ_start: new Date("2000-01-01"),
        employ_deadline: new Date("2000-01-01"),
        next_notification: undefined,
    }), []);

    const normalizedEdit: MasterStaffOptionUpsertInput | null = useMemo(() => {
        if (!isUpdate || !editValues) return null;
        return {
            ...baseDefaults,
            ...editValues,
            staff_id: (editValues as MasterStaffOptionType).staff_id,
            birthday: toDateOrUndefined((editValues as MasterStaffOptionType).birthday),
            employ_start: toDateOrUndefined((editValues as MasterStaffOptionType).employ_start),
            employ_deadline: toDateOrUndefined((editValues as MasterStaffOptionType).employ_deadline),
            next_notification: toDateOrUndefined((editValues as MasterStaffOptionType).next_notification),
        };
    }, [isUpdate, editValues, baseDefaults]);

    const methods = useForm<MasterStaffOptionUpsertInput>({
        resolver: zodResolver(masterStaffOptionUpsertSchema),
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

    // ↓↓↓ スタッフIDに基づき値セット ↓↓↓ //
    const watchingStaffId = useWatch({
        control: methods.control,
        name: "staff_id",
    });
    useEffect(() => {
        const staff = masters?.find((m) => m.staff_id === watchingStaffId);
        methods.setValue("birthday", toDateOrUndefined(staff?.birthday));
        methods.setValue("employ_start", toDateOrUndefined(staff?.employ_start));
        methods.setValue("employ_deadline", toDateOrUndefined(staff?.employ_deadline));
        methods.setValue("next_notification", toDateOrUndefined(staff?.next_notification));
    }, [watchingStaffId, methods, masters, editValues]);
    // ↑↑↑ スタッフIDに基づき値セット ↑↑↑ //

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<MasterStaffOptionUpsertInput | null>(null);
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

    const onSubmit = async (data: MasterStaffOptionUpsertInput) => {
        start(async () => {
            try {
                if (isUpdateInput(data)) {
                    // id 必須、他は partial なので部分更新ペイロードを作成
                    const { id, ...rest } = data;
                    // 型/値検証（任意だが安全）
                    const payload = masterStaffOptionUpdatePayloadSchema.parse(rest);
                    const res = await updateMasterStaffOption(id, payload);
                    if (!res.ok) {
                        toast.error(res.error);
                        onClose();
                        return;
                    }
                    toast.success("更新しました");
                } else {
                    const res = await createMasterStaffOption(data);
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
                        <StaffSelectField
                            name="staff_id"
                            label="スタッフ"
                            nonDefault={true}
                            exceptIds={isUpdate ? [] : masters?.map(m=>m.staff_id)}
                            />

                        <EmployTypeSelectField
                            name="employ_type_id"
                            label="雇用形態"
                            />

                        <SelectDateField
                            name="birthday"
                            label="生年月日"
                            />

                        <DateRangeField
                            fromName="employ_start"
                            toName="employ_deadline"
                            labelStart="入社日"
                            labelEnd="雇用満了日"
                            />

                        <SelectDateField
                            name="next_notification"
                            label="次回通知日"
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
