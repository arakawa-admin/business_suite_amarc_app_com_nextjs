"use client";
import { Grid, Stack, Typography, Divider, Paper } from "@mui/material";
import { FieldValues, useFormContext, useWatch } from "react-hook-form";
import type { FieldDef, SlotFieldDef } from "./types";

import DateRangeField from "@ui/form/DateRangeField";
import TimeRangeField from "@ui/form/TimeRangeField";
import SelectDateField from "@ui/form/SelectDateField";
import TextInputField from "@ui/form/TextInputField";
import TextareaInputField from "@ui/form/TextareaInputField";
import NumberInputField from "@ui/form/NumberInputField";
import RadioSelectField from "@ui/form/RadioSelectField";
import StaffSelectField from "@/components/form/apply/StaffSelectField";
import DepartmentSelectField from "@ui/form/DepartmentSelectField";
import SwitchField from "@ui/form/SwitchField";
import FileInputField from "@ui/form/FileInputField";
import MultipleSelectCheckmarkField from "@ui/form/MultipleSelectCheckmarkField";
import SelectField from "@ui/form/SelectField";

type Slots = Record<string, React.ReactNode>;

type Props<T extends FieldValues> = {
    field: FieldDef<T>;
    disabled?: boolean;
    slots?: Slots;
};

export default function FieldRenderer<T extends FieldValues>({
    field,
    disabled,
    slots,
}: Props<T>) {
    const { control } = useFormContext<T>();
    const watchNames = [
        (field.visibleIf?.name ?? "__dummy_visible__"),
        (field.disabledIf?.name ?? "__dummy_disabled__"),
    ] as any;

    const watched = useWatch({
        control,
        name: watchNames,
    }) as unknown[];

    const [visibleWatchValue, disabledWatchValue] = watched;

    // ---- visibleIf 判定 ----
    const shouldShow = field.visibleIf
        ? Object.is(visibleWatchValue, field.visibleIf.equals)
        : true;

    if (!shouldShow) return null;

    // ---- disabled 判定（全体 + field.disabled + disabledIf）----
    const isDisabled =
        !!disabled ||
        // !!field.disabled ||
        (field.disabledIf
            ? Object.is(disabledWatchValue, field.disabledIf.equals)
            : false);


    // グリッド幅（未定義なら12）
    const gridSize = (field as any).gridSize ?? 12;

    // --------------------------
    // ✅ group（再帰）
    // --------------------------
    if ((field as any).type === "group") {
        const label = (field as any).label as string | undefined;
        const children = (field as any).fields as FieldDef<T>[];

        return (
            <Grid size={gridSize}>
                <Paper variant="outlined" sx={{ p: 1 }}>
                    <Stack spacing={1}>
                        {label && (
                            <>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {label}
                            </Typography>
                            <Divider />
                            </>
                        )}

                        <Grid container spacing={1}>
                            {children.map((child, idx) => (
                            <FieldRenderer
                                key={`${(child as any).type}-${(child as any).name ?? (child as any).slotKey ?? idx}`}
                                field={child}
                                disabled={isDisabled}   // ✅ 親のdisabledを子へ伝播
                                slots={slots}
                            />
                            ))}
                        </Grid>
                    </Stack>
                </Paper>
            </Grid>
        );
    }
    // name が無いタイプ（dateRange）を考慮して安全に
    const name = (field as any).name ? String((field as any).name) : undefined;
    const label = (field as any).label as string | undefined;

    const type = (field as any).type as string;
    const rows = (field as any).rows as number | undefined;
    const radioOptions = (field as any).radioOptions as any | undefined;
    const selectOptions = (field as any).selectOptions as any | undefined;
    const selectDeptOptions = (field as any).selectDeptOptions as any | undefined;
    const selectStaffOptions = (field as any).selectStaffOptions as any | undefined;
    const fileOptions = (field as any).fileOptions as any | undefined;
    const inputOptions = (field as any).inputOptions as any | undefined;
    const switchOptions = (field as any).switchOptions as any | undefined;
    const dateRangeOptions = (field as any).dateRangeOptions as any | undefined;
    const timeRangeOptions = (field as any).timeRangeOptions as any | undefined;

    const rendered = (() => {
        switch (type) {
            case "date":
                if (!name) return null;
                return <SelectDateField name={name} label={label} disabled={isDisabled} />;

            case "dateRange":
                return <DateRangeField {...dateRangeOptions} disabled={isDisabled} />;

            case "timeRange":
                return <TimeRangeField {...timeRangeOptions} disabled={isDisabled} />;

            case "text":
                if (!name) return null;
                return (
                    <TextInputField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        {...inputOptions}
                    />
                );

            case "textarea":
                if (!name) return null;
                return (
                    <TextareaInputField
                        name={name}
                        label={label}
                        minRows={rows ?? 3}
                        disabled={isDisabled}
                    />
                );

            case "number":
                if (!name) return null;
                return (
                    <NumberInputField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        {...inputOptions}
                    />
                );

            case "radio":
                if (!name) return null;
                return (
                    <RadioSelectField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        options={radioOptions?.items ?? []}
                        row={radioOptions?.row}
                    />
                );

            case "select":
                if (!name) return null;
                return (
                    <SelectField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        options={selectOptions?.items ?? []}
                    />
                );

            case "multiSelect":
                if (!name) return null;
                return (
                    <MultipleSelectCheckmarkField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        options={selectOptions?.items ?? []}
                    />
                );

            case "switch":
                if (!name) return null;
                return (
                    <SwitchField
                        name={name}
                        label={{ true: label ?? "有効", false: label ?? "無効" }}
                        disabled={isDisabled}
                        {...switchOptions}

                    />
                );

            case "file":
                if (!name) return null;
                return (
                    <FileInputField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        {...fileOptions}
                    />
                );

            case "staffId":
                if (!name) return null;
                return <StaffSelectField
                            name={name}
                            label={label}
                            disabled={isDisabled}
                            {...selectStaffOptions}
                            />;

            case "departmentId":
                if (!name) return null;
                return (
                    <DepartmentSelectField
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        {...selectDeptOptions}
                    />
                );

            case "slot": {
                const slotField = field as SlotFieldDef<T>;
                const key = slotField.slotKey;
                if (!key) return null;
                const node = slots?.[key];
                return node ?? null;
            }

            default:
                return null;
        }
    })();

    if (!rendered) return null;

    return <Grid size={gridSize}>{rendered}</Grid>;
}
