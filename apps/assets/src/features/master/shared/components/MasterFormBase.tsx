"use client";

import { useActionState } from "react";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { createInitialMasterFormActionState, type MasterFormActionState } from "../types/masterFormActionState";
import type { MasterCommonFormValues } from "../types/masterCommonTypes";

type EmptyExtra = Record<never, never>;

type Props<
    TExtra extends object = EmptyExtra,
    TExtraFieldName extends string = never,
> = {
    defaultValues: MasterCommonFormValues<TExtra>;
    submitLabel?: string;
    action: (
        prevState: MasterFormActionState<TExtraFieldName>,
        formData: FormData,
    ) => Promise<MasterFormActionState<TExtraFieldName>>;
    renderExtraFields?: (args: {
        defaultValues: MasterCommonFormValues<TExtra>;
        state: MasterFormActionState<TExtraFieldName>;
        isPending: boolean;
    }) => React.ReactNode;
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

export function MasterFormBase<
    TExtra extends object = EmptyExtra,
    TExtraFieldName extends string = never,
>({
    defaultValues,
    submitLabel="保存",
    action,
    renderExtraFields,
}: Props<TExtra, TExtraFieldName>) {
    const [state, formAction, isPending] = useActionState(
        action,
        createInitialMasterFormActionState<TExtraFieldName>(),
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

                {renderExtraFields?.({
                    defaultValues,
                    state,
                    isPending,
                })}

                <TextField
                    name="validAt"
                    label="有効開始日時"
                    type="datetime-local"
                    defaultValue={toDatetimeLocalValue(defaultValues.validAt)}
                    error={!!state.fieldErrors.validAt?.length}
                    helperText={state.fieldErrors.validAt?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="invalidAt"
                    label="有効終了日時"
                    type="datetime-local"
                    defaultValue={toDatetimeLocalValue(defaultValues.invalidAt)}
                    error={!!state.fieldErrors.invalidAt?.length}
                    helperText={state.fieldErrors.invalidAt?.[0]}
                    disabled={isPending}
                />

                <Button type="submit" variant="contained" size="large" disabled={isPending} sx={{ py: 2, fontWeight: "bold", fontSize: "1.25rem" }}>
                    {submitLabel}
                </Button>
            </Stack>
        </Box>
    );
}
