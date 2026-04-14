"use client";

import * as React from "react";
import { Stack } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { isBefore, startOfDay, startOfMonth, startOfYear, endOfDay } from "date-fns";

import SelectAnyDate, { DateMode } from "@ui/form/SelectAnyDate";

type Granularity = "day" | "month" | "year";

type Props = {
    fromName?: string;
    toName?: string;
    labelStart?: string;
    labelEnd?: string;
    minDate?: Date;
    maxDate?: Date;
    granularity?: Granularity;
    disabled?: boolean
};

function normalize(mode: DateMode, d: Date) {
    switch (mode) {
        case "year":
            return startOfYear(d);
        case "month":
            return startOfMonth(d);
        default:
            return startOfDay(d);
    }
}

export default function DateRangeField({
    fromName = "from",
    toName = "to",
    labelStart = "開始",
    labelEnd = "終了",
    minDate,
    maxDate = new Date("2050-12-31"),
    granularity = "day",
    disabled = false,
}: Props) {
    const { control, setValue, getValues } = useFormContext();
    const mode: DateMode = granularity;

    const start = useWatch({ control, name: fromName }) as Date | null;

    const endBeforeStart = React.useCallback(
        (s: Date | null | undefined, e: Date | null | undefined) => {
            if (!s || !e) return false;
            return isBefore(normalize(mode, e), normalize(mode, s));
        },
        [mode]
    );

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {/* 開始 */}
            <Controller
                name={fromName}
                control={control}
                defaultValue={null}
                disabled={disabled}
                render={({ field }) => (
                    <SelectAnyDate
                        mode={mode}
                        label={labelStart}
                        value={field.value ?? null}
                        minDate={minDate}
                        maxDate={maxDate}
                        onChange={(d) => {
                            field.onChange(d ? startOfDay(d) : null);

                            // 終了が開始より前なら、開始に寄せる
                            const curEnd = getValues(toName) as Date | null;
                            if (d && endBeforeStart(d, curEnd)) {
                                setValue(toName as any, d, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }
                        }}
                    />
                )}
            />

            <span>〜</span>

            {/* 終了 */}
            <Controller
                name={toName}
                control={control}
                defaultValue={null}
                disabled={disabled}
                render={({ field }) => (
                    <SelectAnyDate
                        mode={mode}
                        label={labelEnd}
                        value={field.value ?? null}
                        // 終了のminは開始日（ある場合）を優先
                        minDate={start ?? minDate}
                        maxDate={maxDate}
                        onChange={(d) => field.onChange(d ? endOfDay(d) : null)}
                    />
                )}
            />
        </Stack>
    );
}
