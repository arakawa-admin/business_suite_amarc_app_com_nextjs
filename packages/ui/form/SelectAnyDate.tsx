"use client";

import { useEffect, useCallback, useMemo } from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@mui/icons-material";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";

import {
    addDays,
    addMonths,
    addYears, subYears,
    startOfDay,
    startOfMonth,
    startOfYear,
    isBefore,
    isAfter,
} from "date-fns";

import { useState } from "react";

export type DateMode = "day" | "month" | "year";

export type SelectAnyDateProps = {
    mode?: DateMode;        // day | month | year
    value: Date | null;
    label?: string;
    onChange: (d: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
};

export default function SelectAnyDate({
    mode="day",
    value,
    label,
    onChange,
    minDate = subYears(new Date(), 80),  // 過去80年
    maxDate = addYears(new Date(), 20),  // 未来20年
}: SelectAnyDateProps) {

    // 初期値は mode に合わせて正規化
    const normalize = useCallback((d: Date) => {
        switch (mode) {
            case "year":  return startOfYear(d);
            case "month": return startOfMonth(d);
            default:      return startOfDay(d);
        }
    }, [mode]);

    // ★ 比較用 min/max も同じ粒度に正規化（UTC→JSTズレ対策）
    const minBound = useMemo(() => normalize(minDate), [minDate, normalize]);
    const maxBound = useMemo(() => normalize(maxDate), [maxDate, normalize]);

    const [selected, setSelected] = useState<Date>(
        value ? normalize(value) : normalize(new Date())
    );
    useEffect(() => {
        if (value) {
            setSelected(normalize(value));
        }
    }, [value, mode, normalize]);

    const handleChange = (date: Date | null) => {
        if (!date) return;

        const norm = normalize(date);

        // 範囲外は無視（DatePicker側と合わせる）
        if (isBefore(norm, minBound) || isAfter(norm, maxBound)) return;

        // 同じ値なら React の再レンダリング抑制
        if (selected && norm.getTime() === selected.getTime()) return;

        setSelected(norm);
        onChange(norm);
    };

    // モードに応じた ±1 移動処理
    const goDelta = (delta: number) => {
        let next;
        switch (mode) {
            case "year":
                next = startOfYear(addYears(selected, delta));
                break;
            case "month":
                next = startOfMonth(addMonths(selected, delta));
                break;
            default:
                next = startOfDay(addDays(selected, delta));
                break;
        }

        if (isBefore(next, minBound) || isAfter(next, maxBound)) return;

        setSelected(next);
        onChange(next);
    };

    // DatePicker 設定を mode によって切り替
    type DateView = "year" | "month" | "day";
    const pickerViews: readonly DateView[] =
        mode === "year"
            ? ["year"] as const
            : mode === "month"
            ? ["year", "month"] as const
            : ["year", "month", "day"] as const;

    const pickerFormat =
        mode === "year"
            ? "yyyy年"
            : mode === "month"
            ? "yyyy年MM月"
            : "yyyy年MM月dd日";

    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                    label={label ?? undefined}
                    views={pickerViews}
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 2,
                    }}
                    openTo={mode === "year" ? "year" : mode === "month" ? "month" : "day"}
                    value={selected}
                    onChange={handleChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    format={pickerFormat}
                    slotProps={{
                        toolbar: { hidden: true },
                        calendarHeader: { format: "yyyy年" },
                    }}
                />
            </LocalizationProvider>

            <ButtonGroup variant="contained" color="primary" size="small" sx={{ my: 1 }}>
                <Button onClick={() => handleChange(new Date())}>
                    {mode === "year" ? "今年" : mode === "month" ? "今月" : "今日"}
                </Button>

                <Button onClick={() => goDelta(-1)}>
                    <ArrowLeftOutlined />
                </Button>

                <Button onClick={() => goDelta(1)}>
                    <ArrowRightOutlined />
                </Button>
            </ButtonGroup>
        </Stack>
    );
}
