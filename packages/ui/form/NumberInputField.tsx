"use client";

import * as React from "react";
import { FormControl, TextField, InputAdornment } from "@mui/material";
import { Controller, useFormContext, useController } from "react-hook-form";

type Props = {
    name: string;
    label?: string;
    step?: number;
    min?: number;
    max?: number;
    sx?: object;
    disabled?: boolean;
    startAdornment?: string;
    endAdornment?: string;
};

const toStr = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const isPartial = (s: string) => s === "" || s === "-" || s === "." || s === "-.";

export default function NumberInputField({
    name,
    label,
    step = 1,
    min,
    max,
    sx = { mt: 0 },
    disabled = false,
    startAdornment,
    endAdornment,
}: Props) {
    const { control } = useFormContext();

    const { field, fieldState } = useController({
        name,
        control,
    });

    // 画面表示用（入力途中の "-" "." などを保持）
    const [display, setDisplay] = React.useState<string>(toStr(field.value));

    // reset / 外部更新に追従
    React.useEffect(() => {
        // 入力中に上書きされたくないなら、ここで条件付けも可
        setDisplay(toStr(field.value));
    }, [field.value]);

    // 最後に確定した有効値
    const lastValidRef = React.useRef<number | undefined>(
        typeof field.value === "number" ? field.value : undefined
    );

    React.useEffect(() => {
        if (typeof field.value === "number") lastValidRef.current = field.value;
    }, [field.value]);

    // 整数/小数パターン切替（負数は min < 0 なら許可）
    const isInteger = Number.isInteger(step);
    const allowNegative = min !== undefined ? min < 0 : true;

    const pattern = React.useMemo(() => {
        return isInteger
            ? allowNegative
                ? "^-?[0-9]*$"
                : "^[0-9]*$"
            : allowNegative
                ? "^-?[0-9]*([.,][0-9]*)?$"
                : "^[0-9]*([.,][0-9]*)?$";
    }, [isInteger, allowNegative]);

    const inputMode = isInteger ? "numeric" : "decimal";

    const tryCommitNumber = React.useCallback(
        (raw: string) => {
            const s = raw.trim().replace(",", ".");
            if (isPartial(s)) return;

            if (!(new RegExp(pattern).test(s))) return;

            const num = Number(s);
            if (!Number.isFinite(num)) return;

            // min/max 判定（<= / >= だと境界が弾かれるので < / > が自然）
            if (min !== undefined && num < min) return;
            if (max !== undefined && num > max) return;

            field.onChange(num); // ✅ RHFには number だけ入れる
            lastValidRef.current = num;
        },
        [field, min, max, pattern]
    );

    return (
        <FormControl
            fullWidth
            error={!!fieldState.error}
            sx={sx}
            >
            <Controller
                name={name}
                control={control}
                defaultValue={undefined}
                disabled={disabled}
                render={({ field }) => (
                    <TextField
                        type="text" // iOS対策：textで制御
                        label={label ?? ""}
                        sx={sx}
                        value={display}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        onFocus={(e) => e.target.select()}
                        slotProps={{
                            input: {
                                inputProps: { inputMode, pattern },
                                startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
                                endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>,
                            },
                        }}
                        onChange={(e) => {
                            const v = e.target.value;

                            // 表示は常に更新（途中入力OK）
                            setDisplay(v);

                            // パースできる時だけ数値をcommit
                            tryCommitNumber(v);
                        }}
                        onBlur={(e) => {
                            field.onBlur();

                            const raw = e.target.value.trim().replace(",", ".");
                            if (isPartial(raw)) {
                                // 未確定は lastValid に戻す（未入力許可なら undefined のままでOK）
                                const lv = lastValidRef.current;
                                field.onChange(lv);
                                setDisplay("");
                                return;
                            }

                            const num = Number(raw);
                            if (!Number.isFinite(num)) {
                                const lv = lastValidRef.current;
                                field.onChange(lv);
                                setDisplay(toStr(lv));
                                return;
                            }

                            if (min !== undefined && num < min) {
                                const lv = lastValidRef.current;
                                field.onChange(lv);
                                setDisplay(toStr(lv));
                                return;
                            }
                            if (max !== undefined && num > max) {
                                const lv = lastValidRef.current;
                                field.onChange(lv);
                                setDisplay(toStr(lv));
                                return;
                            }

                            // 最終確定
                            field.onChange(num);
                            lastValidRef.current = num;
                            setDisplay(toStr(num));
                        }}
                    />
                )}
            />
        </FormControl>
    );
}
