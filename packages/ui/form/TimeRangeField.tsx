"use client";

import { Stack } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { isBefore } from "date-fns";

type Props = {
    startName: string;
    endName: string;
    labelStart: string;
    labelEnd: string;
    disabled?: boolean;
    minutesStep?: number;
};

export default function TimeRangeField({
    startName,
    endName,
    labelStart,
    labelEnd,
    disabled = false,
    minutesStep = 5,
}: Props) {
    const { control, setValue, getValues } = useFormContext();
    const start = useWatch({ control, name: startName }) as Date | undefined;

    // 「時刻だけ変えて、日付部分は維持」したい時のヘルパ
    const mergeTime = (base: Date | null | undefined, t: Date) => {
        const b = base ? new Date(base) : new Date();
        b.setHours(t.getHours(), t.getMinutes(), 0, 0);
        return b;
    };

    const endBeforeStart = (s: Date | null | undefined, e: Date | null | undefined) => {
        if (!s || !e) return false;
        return isBefore(e, s);
    };

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {/* 開始 */}
            <Controller
                name={startName}
                control={control}
                render={({ field, fieldState }) => (
                <TimePicker
                    label={labelStart}
                    value={field.value ?? null}
                    onChange={(v) => {
                        if (!v) {
                            field.onChange(null);
                            return;
                        }

                        // ✅ startの日付を固定（既存startがあればそれを基準、なければendを基準、なければ今日）
                        const curEnd = getValues(endName) as Date | null;
                        const base = (field.value as Date | null) ?? curEnd ?? new Date();

                        const nextStart = mergeTime(base, v);
                        field.onChange(nextStart);

                        // ✅ 終了が開始より前なら開始に寄せる（同じ日付で比較できる）
                        const nextEnd = curEnd ? mergeTime(nextStart, curEnd) : null;
                        if (nextEnd && endBeforeStart(nextStart, nextEnd)) {
                            setValue(endName as any, nextStart, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                    }}
                    disabled={disabled}
                    minutesStep={minutesStep}
                    slotProps={{
                        textField: {
                            error: !!fieldState.error,
                            helperText: fieldState.error?.message,
                        },
                    }}
                />
                )}
            />

            <span>〜</span>

            {/* 終了 */}
            <Controller
                name={endName}
                control={control}
                render={({ field, fieldState }) => (
                <TimePicker
                    label={labelEnd}
                    value={field.value ?? null}
                    onChange={(v) => {
                        if (!v) {
                            field.onChange(null);
                            return;
                        }

                        // ✅ endはstartの日付に寄せる（startが無いなら、今のend or 今日を基準）
                        const base = start ?? (field.value as Date | null) ?? new Date();
                        const nextEnd = mergeTime(base, v);
                        field.onChange(nextEnd);

                        // ✅ startがあって end < start なら endをstartに寄せる（弾く/寄せるは好みで）
                        if (start && isBefore(nextEnd, start)) {
                            setValue(endName as any, start, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }
                    }}
                    disabled={disabled}
                    minTime={start}
                    minutesStep={minutesStep}
                    slotProps={{
                        textField: {
                            error: !!fieldState.error,
                            helperText: fieldState.error?.message,
                        },
                    }}
                />
                )}
            />
        </Stack>
    );
}
