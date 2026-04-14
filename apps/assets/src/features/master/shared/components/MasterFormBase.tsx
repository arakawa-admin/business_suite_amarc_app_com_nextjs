"use client";

import { useActionState } from "react";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { createInitialMasterFormActionState } from "../helpers/masterFormActionState";
import type { MasterFormActionState } from "../types/masterFormActionState";
import type { MasterCommonFormValues } from "../types/masterCommonTypes";

type Props = {
    defaultValues: MasterCommonFormValues;
    submitLabel: string;
    action: (
        prevState: MasterFormActionState,
        formData: FormData,
    ) => Promise<MasterFormActionState>;
};

function toDatetimeLocalValue(value: string | null): string {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function MasterFormBase({
    defaultValues,
    submitLabel,
    action,
}: Props) {
    const [state, formAction, isPending] = useActionState(
        action,
        createInitialMasterFormActionState(),
    );

    return (
        <Box component="form" action={formAction}>
            <Stack spacing={3}>
                {state.formError ? (
                    <Alert severity="error">{state.formError}</Alert>
                ) : null}

                <TextField
                    name="code"
                    label="コード"
                    defaultValue={defaultValues.code}
                    required
                    error={!!state.fieldErrors.code?.length}
                    helperText={state.fieldErrors.code?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="name"
                    label="名称"
                    defaultValue={defaultValues.name}
                    required
                    error={!!state.fieldErrors.name?.length}
                    helperText={state.fieldErrors.name?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="sortOrder"
                    label="表示順"
                    type="number"
                    defaultValue={defaultValues.sortOrder}
                    required
                    error={!!state.fieldErrors.sortOrder?.length}
                    helperText={state.fieldErrors.sortOrder?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="remarks"
                    label="備考"
                    defaultValue={defaultValues.remarks}
                    multiline
                    minRows={3}
                    error={!!state.fieldErrors.remarks?.length}
                    helperText={state.fieldErrors.remarks?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="validAt"
                    label="有効開始日時"
                    type="datetime-local"
                    defaultValue={toDatetimeLocalValue(defaultValues.validAt)}
                    // InputLabelProps={{ shrink: true }}
                    error={!!state.fieldErrors.validAt?.length}
                    helperText={state.fieldErrors.validAt?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="invalidAt"
                    label="有効終了日時"
                    type="datetime-local"
                    defaultValue={toDatetimeLocalValue(defaultValues.invalidAt)}
                    // InputLabelProps={{ shrink: true }}
                    error={!!state.fieldErrors.invalidAt?.length}
                    helperText={state.fieldErrors.invalidAt?.[0]}
                    disabled={isPending}
                />

                <Stack direction="row" justifyContent="flex-end">
                    <Button type="submit" variant="contained" disabled={isPending}>
                        {submitLabel}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
