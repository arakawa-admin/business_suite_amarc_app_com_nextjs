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
    categoryOptions: CategoryOption[];
};

const statusOptions = [
    { value: "", label: "すべて" },
    { value: "unknown", label: "不明" },
    { value: "expired", label: "期限切れ" },
    { value: "alert_due", label: "期限近い" },
    { value: "active", label: "有効" },
] as const;

export function PermitListFilter({ categoryOptions }: Props) {
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
    const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") ?? "");
    const [status, setStatus] = useState(searchParams.get("status") ?? "");

    function buildNextQuery() {
        const params = new URLSearchParams(searchParams.toString());

        if (keyword.trim()) {
            params.set("q", keyword.trim());
        } else {
            params.delete("q");
        }

        if (categoryId) {
            params.set("categoryId", categoryId);
        } else {
            params.delete("categoryId");
        }

        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }

        params.delete("page");

        return params.toString();
    }

    function handleSearch() {
        const next = buildNextQuery();
        router.push(next ? `${pathname}?${next}` : pathname);
    }

    function handleReset() {
        setKeyword("");
        setCategoryId("");
        setStatus("");
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
                        label="分類"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="">すべて</MenuItem>
                        {categoryOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
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
                    </TextField>

                    <TextField
                        label="フリーワード"
                        placeholder="対象・業・許可番号で検索"
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
