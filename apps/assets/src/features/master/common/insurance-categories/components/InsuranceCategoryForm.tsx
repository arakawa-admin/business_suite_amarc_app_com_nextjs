"use client";
import { TextField } from "@mui/material";
import { MasterFormBase } from "../../../shared/components/MasterFormBase";
import type { MasterFormActionState } from "../../../shared/types/masterFormActionState";
import type { InsuranceCategoryActionState } from "../types/insuranceCategoryTypes";

type ExtraFieldName =
    | "updateNote"
    | "accidentInternalNote"
    | "accidentExternalNote";

type Props = {
    defaultValues: InsuranceCategoryActionState;
    action: (
        prevState: MasterFormActionState<ExtraFieldName>,
        formData: FormData,
    ) => Promise<MasterFormActionState<ExtraFieldName>>;
    submitLabel?: string;
};

export function InsuranceCategoryForm({
    defaultValues,
    action,
    submitLabel = "登録",
}: Props) {
    return (
        <MasterFormBase<
            {
                updateNote: string;
                accidentInternalNote: string;
                accidentExternalNote: string;
            },
            ExtraFieldName
        >
            defaultValues={defaultValues}
            action={action}
            submitLabel={submitLabel}
            renderExtraFields={({ defaultValues, state, isPending }) => (
                <>
                    <TextField
                        name="updateNote"
                        label="更新時対応メモ"
                        defaultValue={defaultValues.updateNote}
                        multiline
                        minRows={4}
                        error={!!state.fieldErrors.updateNote?.length}
                        helperText={state.fieldErrors.updateNote?.[0]}
                        disabled={isPending}
                    />

                    <TextField
                        name="accidentInternalNote"
                        label="事故時 社内対応メモ"
                        defaultValue={defaultValues.accidentInternalNote}
                        multiline
                        minRows={4}
                        error={!!state.fieldErrors.accidentInternalNote?.length}
                        helperText={state.fieldErrors.accidentInternalNote?.[0]}
                        disabled={isPending}
                    />

                    <TextField
                        name="accidentExternalNote"
                        label="事故時 社外対応メモ"
                        defaultValue={defaultValues.accidentExternalNote}
                        multiline
                        minRows={4}
                        error={!!state.fieldErrors.accidentExternalNote?.length}
                        helperText={state.fieldErrors.accidentExternalNote?.[0]}
                        disabled={isPending}
                    />
                </>
            )}
            />
    );
}
