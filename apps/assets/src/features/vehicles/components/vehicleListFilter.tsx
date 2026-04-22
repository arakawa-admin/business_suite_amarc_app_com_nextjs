"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
    Button,
    Paper,
    Stack,
    MenuItem,
    TextField,
} from "@mui/material";

type CategoryOption = {
    id: string;
    name: string;
};
type Props = {
    departmentOptions: CategoryOption[];
};

// const statusOptions = [
//     { value: "", label: "すべて" },
//     { value: "unknown", label: "不明" },
//     { value: "expired", label: "期限切れ" },
//     { value: "alert_due", label: "期限近い" },
//     { value: "active", label: "有効" },
// ] as const;

export function VehicleListFilter({ departmentOptions }: Props) {
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
    const [departmentId, setDepartmentId] = useState(searchParams.get("departmentId") ?? "");
    // const [status, setStatus] = useState(searchParams.get("status") ?? "");

    function buildNextQuery() {
        const params = new URLSearchParams(searchParams.toString());

        if (keyword.trim()) {
            params.set("q", keyword.trim());
        } else {
            params.delete("q");
        }

        if (departmentId) {
            params.set("departmentId", departmentId);
        } else {
            params.delete("departmentId");
        }

        // if (status) {
        //     params.set("status", status);
        // } else {
        //     params.delete("status");
        // }

        params.delete("page");

        return params.toString();
    }

    function handleSearch() {
        const next = buildNextQuery();
        router.push(next ? `${pathname}?${next}` : pathname);
    }

    function handleReset() {
        setKeyword("");
        setDepartmentId("");
        // setStatus("");
        router.push(pathname);
    }

    return (
        <Paper
            // variant="outlined"
            sx={{ p: 2, borderRadius: 4 }}
            elevation={4}
            >
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                >
                    <TextField
                        select
                        label="部門"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="">すべて</MenuItem>
                        {departmentOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* <TextField
                        select
                        label="状態"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField> */}

                    <TextField
                        label="フリーワード"
                        placeholder="登録番号・メーカー名・車名・タイプで検索"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        fullWidth
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                    />

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Button variant="contained" onClick={handleSearch}>
                            検索
                        </Button>
                        <Button variant="outlined" onClick={handleReset}>
                            クリア
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}
