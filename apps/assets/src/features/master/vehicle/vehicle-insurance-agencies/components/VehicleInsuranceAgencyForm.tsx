"use client";

import { useActionState } from "react";
import {
    Alert,
    Box,
    Button,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import type {
    VehicleInsuranceAgencyFormValues,
    VehicleInsuranceCategoryOption,
} from "../types/vehicleInsuranceAgencyTypes";

type AgencyFieldName =
    | "insuranceCategoryId"
    | "insuranceCompanyName"
    | "agencyName"
    | "contactPersonName"
    | "mobilePhone"
    | "tel"
    | "fax"
    | "remarks"
    | "validAt"
    | "invalidAt";

type AgencyFormActionState = MasterFormActionState<AgencyFieldName>;

type Props = {
    defaultValues: VehicleInsuranceAgencyFormValues;
    categoryOptions: VehicleInsuranceCategoryOption[];
    submitLabel?: string;
    action: (
        prevState: AgencyFormActionState,
        formData: FormData,
    ) => Promise<AgencyFormActionState>;
};

const initialState: AgencyFormActionState = {
    ok: false,
    fieldErrors: {},
    formError: null,
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

export function VehicleInsuranceAgencyForm({
    defaultValues,
    categoryOptions,
    submitLabel="保存",
    action,
}: Props) {
    const [state, formAction, isPending] = useActionState(action, initialState);

    return (
        <Box component="form" action={formAction}>
            <Stack spacing={3}>
                {state.formError ? (
                    <Alert severity="error">{state.formError}</Alert>
                ) : null}

                <TextField
                    select
                    name="insuranceCategoryId"
                    label="保険カテゴリ"
                    defaultValue={defaultValues.insuranceCategoryId}
                    required
                    error={!!state.fieldErrors.insuranceCategoryId?.length}
                    helperText={state.fieldErrors.insuranceCategoryId?.[0]}
                    disabled={isPending}
                >
                    {categoryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    name="insuranceCompanyName"
                    label="保険会社名"
                    defaultValue={defaultValues.insuranceCompanyName}
                    required
                    error={!!state.fieldErrors.insuranceCompanyName?.length}
                    helperText={state.fieldErrors.insuranceCompanyName?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="agencyName"
                    label="代理店名"
                    defaultValue={defaultValues.agencyName}
                    error={!!state.fieldErrors.agencyName?.length}
                    helperText={state.fieldErrors.agencyName?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="contactPersonName"
                    label="担当者名"
                    defaultValue={defaultValues.contactPersonName}
                    error={!!state.fieldErrors.contactPersonName?.length}
                    helperText={state.fieldErrors.contactPersonName?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="mobilePhone"
                    label="携帯電話"
                    defaultValue={defaultValues.mobilePhone}
                    error={!!state.fieldErrors.mobilePhone?.length}
                    helperText={state.fieldErrors.mobilePhone?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="tel"
                    label="電話番号"
                    defaultValue={defaultValues.tel}
                    error={!!state.fieldErrors.tel?.length}
                    helperText={state.fieldErrors.tel?.[0]}
                    disabled={isPending}
                />

                <TextField
                    name="fax"
                    label="FAX番号"
                    defaultValue={defaultValues.fax}
                    error={!!state.fieldErrors.fax?.length}
                    helperText={state.fieldErrors.fax?.[0]}
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

                <Stack direction="row" justifyContent="flex-end">
                    <Button type="submit" variant="contained" disabled={isPending}>
                        {submitLabel}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
