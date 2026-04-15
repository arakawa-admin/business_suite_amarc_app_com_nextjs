"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, FormProvider, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, subMonths } from "date-fns";
import { toast } from "react-toastify";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    Avatar,
} from "@mui/material";
import {
    createPermitSchema,
    permitFormDefaultValues,
    type PermitFormValues,
    type PermitSubmitValues,
} from "../schemas/permitSchema";
import { permitCreateAction, permitEditAction } from "../actions/permitActions";
import TextInputField from "@ui/form/TextInputField";
import TextareaInputField from "@ui/form/TextareaInputField";
import SelectDateField from "@ui/form/SelectDateField";
import AutocompleteField from "@ui/form/AutocompleteField";
import SelectField from "@ui/form/SelectField";

import { AttachmentUploader } from "@/features/attachments/components/AttachmentUploader";
import { PermitAttachmentFormValues } from "@/features/permits/schemas/permitSchema";

type Props = {
    mode: "create" | "edit";
    editId?: string;
    defaultValues?: Partial<PermitFormValues>;
    categoryNameOptions: { id: string; name: string }[];
    subjectNameOptions: { id: string; name: string }[];
    businessNameOptions: { id: string; name: string }[];
    intervalLabelOptions: { id: string; name: string }[];
};

export function PermitForm({
    mode,
    editId,
    defaultValues,
    categoryNameOptions,
    subjectNameOptions,
    businessNameOptions,
    intervalLabelOptions,
}: Props) {
    const router = useRouter();
    const isEdit = mode === "edit";

    const methods = useForm<
        PermitFormValues,
        unknown,
        PermitSubmitValues
    >({
        resolver: zodResolver(createPermitSchema),
        defaultValues: {
            ...permitFormDefaultValues,
            ...defaultValues,
        },
        mode: "onBlur",
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "reminders",
    });

    const [reminderStepMonths, setReminderStepMonths] = useState(0);
    const [alertLeadMonths, setAlertLeadMonths] = useState(0);
    const [attachments, setAttachments] = useState<PermitAttachmentFormValues[]>([]);

    const handleSubmit = methods.handleSubmit(async (values) => {
        try {
            if (isEdit) {
                if (!editId) throw new Error("editId がありません。");
                await permitEditAction({ ...values, attachments }, editId);
                toast.success("許認可を更新しました");
                setTimeout(() => {
                    router.replace(`/permits/${editId}`);
                    router.refresh();
                }, 800);
            } else {
                const createdPermit = await permitCreateAction({
                    ...values,
                    attachments,
                });
                toast.success("許認可を新規登録しました");
                setTimeout(() => {
                    router.replace(`/permits/${createdPermit.id}`);
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
            const issuedOn = methods.getValues("issuedOn");
            if (issuedOn) {
                const nextDueOn = addMonths(issuedOn, reminderStepMonths);
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
                    <Typography variant="body1" sx={{ px: 1, fontWeight: "bold" }}>許認可 {isEdit ? "編集" : "新規登録"}</Typography>
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                基本情報
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <SelectField
                                        name="categoryId"
                                        label="分類"
                                        options={categoryNameOptions}
                                    />
                                    {/* <AutocompleteField
                                        name="categoryId"
                                        label="分類"
                                        options={categoryNameOptions}
                                        required
                                    /> */}

                                    <AutocompleteField
                                        name="subjectName"
                                        label="対象"
                                        options={subjectNameOptions}
                                        freeSolo
                                        required
                                    />

                                    <AutocompleteField
                                        name="businessName"
                                        label="業"
                                        options={businessNameOptions}
                                        freeSolo
                                        required
                                    />

                                    <TextInputField
                                        name="permitNumber"
                                        label="許可番号"
                                    />
                                </Stack>
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                日付
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <SelectDateField
                                        name="issuedOn"
                                        label="許可日 / 発行日"
                                    />

                                    <AutocompleteField
                                        name="requiredIntervalLabel"
                                        label="更新頻度"
                                        options={intervalLabelOptions}
                                        placeholder="例: 2年ごと"
                                        freeSolo
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
                                                1つ目の場合は”発行日”、2つ目以降の場合は1つ前の有効期限を基準日として、追加ルールに従って有効期限を追加します。
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
                                <AttachmentUploader
                                    value={attachments}
                                    onChange={setAttachments}
                                    // label="添付ファイル"
                                />
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ p: 1, color: "text.secondary" }}>
                                状態・補足
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack spacing={2}>
                                    <Controller
                                        name="requiresPriorCertificate"
                                        control={methods.control}
                                        render={({ field }) => (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onChange={(_, checked) => field.onChange(checked)}
                                                    />
                                                }
                                                label="先行許可証の提示が必要"
                                            />
                                        )}
                                    />

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
