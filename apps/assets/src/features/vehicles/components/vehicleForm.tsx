"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, subMonths } from "date-fns";
import { toast } from "react-toastify";
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    Avatar,
} from "@mui/material";
import {
    createVehicleSchema,
    vehicleFormDefaultValues,
    type VehicleFormValues,
    type VehicleSubmitValues,
} from "../schemas/vehicleSchema";
import { vehicleCreateAction, vehicleEditAction } from "../actions/vehicleActions";
import TextInputField from "@ui/form/TextInputField";
import TextareaInputField from "@ui/form/TextareaInputField";
import SelectDateField from "@ui/form/SelectDateField";
import SwitchField from "@ui/form/SwitchField";
import SelectField from "@ui/form/SelectField";

import { VehicleAttachmentUploader } from "@/features/attachments/components/VehicleAttachmentUploader";
import {
    type AttachmentFormItem,
} from "@/features/attachments/types/attachmentUiTypes";

type Props = {
    mode: "create" | "edit";
    editId?: string;
    defaultValues?: Partial<VehicleFormValues>;
    departmentNameOptions: { id: string; name: string }[];
    voluntaryInsuranceAgencyNameOptions: { id: string; name: string }[];
    defaultAttachments?: AttachmentFormItem[];
};

export function VehicleForm({
    mode,
    editId,
    defaultValues,
    departmentNameOptions,
    voluntaryInsuranceAgencyNameOptions,
    defaultAttachments,
}: Props) {
    const router = useRouter();
    const isEdit = mode === "edit";

    const methods = useForm<
        VehicleFormValues,
        unknown,
        VehicleSubmitValues
    >({
        resolver: zodResolver(createVehicleSchema),
        defaultValues: {
            ...vehicleFormDefaultValues,
            ...defaultValues,
        },
        mode: "onBlur",
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "reminders",
    });

    const [reminderStepMonths, setReminderStepMonths] = useState(24);
    const [alertLeadMonths, setAlertLeadMonths] = useState(3);
    const [attachments, setAttachments] = useState<AttachmentFormItem[]>(
        defaultAttachments ?? []
    );


    const handleSubmit = methods.handleSubmit(async (values) => {
        try {
            if (isEdit) {
                if (!editId) throw new Error("editId がありません。");
                await vehicleEditAction({ ...values, attachments }, editId);
                toast.success("車両を更新しました");
                setTimeout(() => {
                    router.replace(`/vehicles/${editId}`);
                    router.refresh();
                }, 800);
            } else {
                const createdVehicle = await vehicleCreateAction({
                    ...values,
                    attachments,
                });
                toast.success("車両を新規登録しました");
                setTimeout(() => {
                    router.replace(`/vehicles/${createdVehicle.id}`);
                    router.refresh();
                }, 800);
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "保存に失敗しました。",
            );
        }
    });

    const addReminders = () => {
        const reminders = methods.getValues("reminders") ?? [];

        if (reminders.length === 0) {
            const firstRegisteredYm = methods.getValues("firstRegisteredYm");
            if (firstRegisteredYm) {
                const nextDueOn = addMonths(firstRegisteredYm, reminderStepMonths);
                const nextAlertOn = subMonths(nextDueOn, alertLeadMonths);

                append({
                    dueOn: nextDueOn,
                    alertOn: nextAlertOn,
                });
                return;
            }

            append({
                dueOn: null,
                alertOn: null,
            });
            return;
        }

        const last = reminders?.length > 0 ? reminders?.slice(-1)[0] : reminders[0];
        if (last?.dueOn) {
            const nextDueOn = addMonths(last.dueOn, reminderStepMonths);
            const nextAlertOn = subMonths(nextDueOn, alertLeadMonths);

            append({
                dueOn: nextDueOn,
                alertOn: nextAlertOn,
            });
        } else {
            append({
                dueOn: null,
                alertOn: null,
            });
        }
    };

    return (
        <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <Typography variant="h5" sx={{ px: 1, fontWeight: "bold" }}>車両 {isEdit ? "編集" : "新規登録"}</Typography>
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                基本情報
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{ p: 3 }}
                                >
                                <Stack spacing={2}>

                                    <TextInputField
                                        name="registrationNumber"
                                        label="登録番号"
                                        placeholder="会津500さ1234"
                                    />

                                    <SelectField
                                        name="departmentId"
                                        label="使用部門"
                                        options={departmentNameOptions}
                                    />

                                    <TextInputField
                                        name="manufacturerName"
                                        label="メーカー名"
                                        placeholder="日野"
                                    />

                                    <TextInputField
                                        name="vehicleName"
                                        label="車名"
                                        placeholder="プロボックス"
                                    />

                                    <TextInputField
                                        name="typeName"
                                        label="タイプ"
                                        placeholder="クレーン付"
                                    />

                                    <TextInputField
                                        name="model"
                                        label="型式"
                                        placeholder="AB-CDEFGH"
                                    />

                                    <TextInputField
                                        name="serialNumber"
                                        label="車台番号又は製造番号"
                                        placeholder="AB-123456789"
                                    />

                                    <SelectDateField
                                        name="firstRegisteredYm"
                                        label="初年度登録年月"
                                        mode="month"
                                    />

                                    <TextInputField
                                        name="ownerName"
                                        label="所有者"
                                        placeholder="荒川産業"
                                    />

                                    <SwitchField
                                        name="isFixedAsset"
                                        title="固定資産計上の有無"
                                        label={{ true: "有り", false: "無し" }}
                                    />

                                    <SwitchField
                                        name="isRegistered"
                                        title="番号登録の有無"
                                        label={{ true: "有り", false: "無し" }}
                                    />

                                    <SelectField
                                        name="voluntaryInsuranceAgencyId"
                                        label="任意保険会社"
                                        options={voluntaryInsuranceAgencyNameOptions}
                                    />

                                    <TextInputField
                                        name="note"
                                        label="備考"
                                        placeholder="備考を入力してください"
                                    />
                                </Stack>
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                有効期限
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <Paper variant="outlined" sx={{ p: 1 }}>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                                追加ルール
                                            </Typography>
                                            <Alert severity="info">
                                                1つ目の場合は”初年度登録年月”、2つ目以降の場合は1つ前の有効期限を基準日として、追加ルールに従って有効期限を追加します。
                                            </Alert>

                                            <Stack spacing={1} direction="row" alignItems="center">
                                                <TextField
                                                    label="有効期限 更新月数"
                                                    type="number"
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: <InputAdornment position="end">ヶ月後</InputAdornment>,
                                                            inputProps: { step: 1, min: 0 },
                                                        },
                                                    }}
                                                    value={reminderStepMonths}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setReminderStepMonths(value === "" ? 0 : Number(value));
                                                    }}
                                                    fullWidth
                                                />

                                                <TextField
                                                    label="アラート 先行月数"
                                                    type="number"
                                                    value={alertLeadMonths}
                                                    slotProps={{
                                                        input: {
                                                            endAdornment: <InputAdornment position="end">ヶ月前</InputAdornment>,
                                                            inputProps: { step: 1, min: 0 },
                                                        },
                                                    }}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setAlertLeadMonths(value === "" ? 0 : Number(value));
                                                    }}
                                                    fullWidth
                                                />
                                            </Stack>
                                        </Stack>
                                    </Paper>

                                    <Stack spacing={2}>
                                        {fields.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                個別日付はまだ登録されていません。
                                            </Typography>
                                        ) : null}

                                        {fields.map((field, index) => (
                                            <Box key={field.id}>
                                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
                                                    <Stack spacing={1} direction="row" alignItems="center" justifyContent={"space-evenly"}>
                                                        <Avatar sx={{ width: 32, height: 32 }}>{index + 1}</Avatar>
                                                        <SelectDateField
                                                            name={`reminders.${index}.dueOn`}
                                                            label="有効期限"
                                                        />

                                                        <SelectDateField
                                                            name={`reminders.${index}.alertOn`}
                                                            label="アラート日"
                                                        />

                                                        <Box>
                                                            <Button
                                                                type="button"
                                                                color="error"
                                                                variant="contained"
                                                                onClick={() => remove(index)}
                                                            >
                                                                削除
                                                            </Button>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            </Box>
                                        ))}

                                        <Box>
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                onClick={addReminders}
                                            >
                                                有効期限を追加
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                添付ファイル
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <VehicleAttachmentUploader
                                    value={attachments}
                                    onChange={setAttachments}
                                />
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                状態・補足
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <TextareaInputField
                                        name="note"
                                        label="備考"
                                        minRows={4}
                                    />
                                </Stack>
                            </Paper>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={methods.formState.isSubmitting}
                            sx={{ width: "100%", minHeight: "4em", fontWeight: "bold", fontSize: "1.25rem", borderRadius: 2 }}
                            color={ (isEdit) ? "warning" : "info" }
                            >
                            {methods.formState.isSubmitting ? "送信中..." : (isEdit) ? "更新する" : "登録する"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </FormProvider>
    );
}
