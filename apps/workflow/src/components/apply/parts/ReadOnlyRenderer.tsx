"use client";

import React from "react";
import { Box, Chip, Grid, Stack, Typography, Paper, Toolbar,
    Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import type { FieldValues } from "react-hook-form";
import type { FieldDef } from "@/features/apply/_core/types"

import { pickChangedRevisionsForField, normalizeForCompare } from "@/features/apply/_core/utils/revisionDiff";
import { isFieldVisible } from "@/features/apply/_core/utils/fieldVisibility";
import { grey } from '@mui/material/colors';
import { format } from "date-fns";
import UploadedFileList from "@ui/form/file/UploadedFileList";
import { AttachmentType } from "@/schemas/apply/attachmentSchema";

type Slots = Record<string, React.ReactNode>;

export type ApplicationRevisionLike = {
    id: string;
    revision_no: number;
    // created_at: string;
    action?: string | null;
    payload: unknown;

    author_label?: string | null;
    department_label?: string | null;
    attachments?: AttachmentType[] | null;
};

type Props<T extends FieldValues> = {
    fields: FieldDef<T>[];
    revisions: ApplicationRevisionLike[];
    slots?: Slots;
    created_at?: Date;

    hideUnchangedFields?: boolean;
    includeFirstRevision?: boolean;

    // formatValue?: (args: { field: FieldDef<T>; value: unknown; latestPayload: unknown }) => React.ReactNode;
};

function getGridSize(field: any) {
    return field.display?.gridSize ?? field.gridSize ?? 12;
}

// function toJaDateTime(iso: string) {
//     console.log(iso)
//     try {
//         return new Date(iso).toLocaleString("ja-JP");
//     } catch {
//         return iso;
//     }
// }


const getByPath = (obj: any, path: string) =>
    path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);

const formatDate = (v: any) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (v: any) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const formatRange = (kind: "date" | "time", a: any, b: any) => {
    const fa = kind === "date" ? formatDate(a) : formatTime(a);
    const fb = kind === "date" ? formatDate(b) : formatTime(b);
    if (!fa && !fb) return null;
    return `${fa ?? "—"} 〜 ${fb ?? "—"}`;
};

const normalizeRangeForCompare = (kind: "date" | "time", a: any, b: any) => {
    // diff判定用に安定した文字列へ
    const s = kind === "date" ? formatDate(a) : formatTime(a);
    const e = kind === "date" ? formatDate(b) : formatTime(b);
    return JSON.stringify([s ?? null, e ?? null]);
};

// range版の「変更があったrevisionだけ拾う」
const pickChangedRevisionsForRange = (
    revisionsAsc: ApplicationRevisionLike[],
    kind: "date" | "time",
    startPath: string,
    endPath: string,
    includeFirst: boolean
) => {
    let prevKey: string | null = null;
    const out: Array<{ revision: ApplicationRevisionLike; value: string | null }> = [];

    for (const rev of revisionsAsc) {
        const p: any = rev.payload ?? {};
        const s = getByPath(p, startPath);
        const e = getByPath(p, endPath);

        const key = normalizeRangeForCompare(kind, s, e);
        const label = formatRange(kind, s, e);

        const changed = prevKey === null ? includeFirst : key !== prevKey;

        if (changed) out.push({ revision: rev, value: label });
        prevKey = key;
    }
    return out;
};

export default function ReadOnlyRendererRevisions<T extends FieldValues>({
    fields,
    revisions,
    slots,
    created_at,
    hideUnchangedFields = false, // TODO
    includeFirstRevision = true,
    // formatValue,
}: Props<T>) {
    const revisionsAsc = React.useMemo(
        () => [...revisions].sort((a, b) => a.revision_no - b.revision_no),
        [revisions]
    );

    const latest = revisionsAsc[revisionsAsc.length - 1];

    // ✅ { } を直書きしない（毎回新規生成を防ぐ）
    const latestPayload = React.useMemo(
        () => latest?.payload ?? null,
        [latest]
    );

    // ✅ default formatter は useCallback で固定
    const formatValue = React.useCallback(
        (args: { field: FieldDef<T>; value: unknown; latestPayload: unknown }) => {
            const field: any = args.field;

            const labelPath = field.display?.labelPath as string | undefined;
            if (labelPath) {
                const labelValue = getByPath(args.latestPayload, labelPath);
                if (labelValue != null && String(labelValue).trim() !== "") {
                    return String(labelValue);
                }
                // labelPathがあるのに取れなければ fallback へ
            }

            const nv = normalizeForCompare(args.value);
            if (field.type === "staffId") {
                if (field.name==="author_id" && latest?.author_label) {
                    return <>{latest?.author_label} <Chip label={latest?.department_label} size="small" /></>;
                }
            }
            // if (field.type === "departmentId" && latest?.department_label) {
            //     return  latest?.department_label;
            // }

            if (nv == null) return <Typography color="text.secondary">（未入力）</Typography>;
            if (field.type === "switch") {
                return nv ? (field as any).switchOptions?.label?.true ?? "はい" : (field as any).switchOptions?.label?.false ?? "いいえ";
            }
            if (field.type === "date" && typeof nv === "string") {
                return formatDate(nv)
            }
            if (field.type === "radio") {
                const items = (field as any).radioOptions?.items ?? [];
                return items.find((x: any) => x.id === nv)?.name ?? String(nv);
            }
            if (field.type === "multiSelect") {
                const items = (field as any).selectOptions?.items ?? [];
                if (Array.isArray(nv)) return nv.map((x: any) => items.find((y: any) => y.id === x)?.name ?? String(x)).join(", ");
                return items.find((x: any) => x.id === nv)?.name ?? String(nv);
            }

            if (typeof nv === "object") return JSON.stringify(nv);

            if (field.display?.formatter) {
                if(field.display?.formatter === "zipcode") {
                    const zipcode = String(nv);
                    return `〒 ${zipcode.slice(0, 3)}-${zipcode.slice(3)}`
                }
            }
            return String(nv);
        },
        [latest?.author_label, latest?.department_label]
    );

    // ✅ fmt は常に1つの関数（条件は中で分岐）
    const fmt = React.useCallback(
        (args: { field: FieldDef<T>; value: unknown; latestPayload: unknown }) => {
            return formatValue({ field: args.field, value: args.value, latestPayload });
        },
        [ formatValue, latestPayload ]
    );

    // ✅ 再帰は「名前付き関数式」で自己参照（immutability対策）
    const renderNode = React.useCallback(
        function renderNode(field: FieldDef<T>, key: string): React.ReactNode | null {
            // visibleIf + display.visible === false
            if (!isFieldVisible<any>(field as any, latestPayload)) return null;

            const type = (field as any).type as string;
            const gridSize = getGridSize(field as any);

            const name = (field as any).name ? String((field as any).name) : undefined;

            // slot（比較対象外）
            if (type === "slot" && !name) {
                const slotKey = (field as any).slotKey as string | undefined;
                const node = slotKey ? slots?.[slotKey] : null;
                if (!node) return null;
                return (
                    <Grid key={key} size={gridSize}>
                        {node}
                    </Grid>
                );
            }

            // group（子が全部nullならgroupも消す）
            if (type === "group") {
                const label = (field as any).label as string | undefined;
                const children = ((field as any).fields ?? []) as FieldDef<T>[];
                const renderedChildren = children
                    .map((c, idx) => {
                        const cKey = `${key}.c${idx}.${(c as any).type}-${(c as any).name ?? (c as any).slotKey ?? idx}`;
                        return renderNode(c, cKey); // ✅ 自分自身
                    })
                    .filter(Boolean) as React.ReactNode[];
                if (renderedChildren.length === 0) return null;

                return (
                    <Grid key={key} size={gridSize}>
                        {label && (
                            <Toolbar
                                sx={{
                                    backgroundColor: grey[500],
                                    color: "success.contrastText",
                                    fontWeight: "bold",
                                    minHeight: "32px!important",
                                }}
                                >
                                {label}
                            </Toolbar>
                        )}
                        <Paper sx={{ p: 2 }} variant="outlined">
                            <Stack spacing={2}>
                                <Grid container spacing={2}>
                                    {renderedChildren}
                                </Grid>
                            </Stack>
                        </Paper>
                    </Grid>
                );
            }

            if (type === "dateRange") {
                const opt = (field as any).dateRangeOptions;
                const from = opt?.fromName ? String(opt.fromName) : null;
                const to   = opt?.toName ? String(opt.toName) : null;
                if (!from || !to) return null;

                const picked = pickChangedRevisionsForRange(
                    revisionsAsc,
                    "date",
                    from,
                    to,
                    includeFirstRevision
                );
                const isUnchanged = includeFirstRevision ? picked.length <= 1 : picked.length === 0;
                if (hideUnchangedFields && isUnchanged) return null;
                if (picked.length === 0) return null;

                const label = (field as any).label as string | undefined;

                return (
                    <Grid key={key} size={gridSize}>
                        <Paper sx={{ p: 2 }} variant="outlined">
                            <Stack spacing={1} sx={{ p: 1 }}>
                                {label && <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>}
                                <Stack spacing={1}>
                                    {picked.map(({ revision, value }) => (
                                    <Box key={revision.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                        {revision.revision_no > 1 && (
                                        <Chip size="small" label={`第${revision.revision_no}版`} sx={{ mt: "2px" }} />
                                        )}
                                        <Typography>{value ?? "—"}</Typography>
                                    </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                );
            }

            if (type === "timeRange") {
                const opt = (field as any).timeRangeOptions;
                const start = opt?.startName ? String(opt.startName) : null;
                const end   = opt?.endName ? String(opt.endName) : null;
                if (!start || !end) return null;

                const picked = pickChangedRevisionsForRange(
                    revisionsAsc,
                    "time",
                    start,
                    end,
                    includeFirstRevision
                );

                const isUnchanged = includeFirstRevision ? picked.length <= 1 : picked.length === 0;
                if (hideUnchangedFields && isUnchanged) return null;
                if (picked.length === 0) return null;

                const label = (field as any).label as string | undefined;

                return (
                    <Grid key={key} size={gridSize}>
                        <Paper sx={{ p: 2 }} variant="outlined">
                            <Stack spacing={1} sx={{ p: 1 }}>
                            {label && <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>}
                            <Stack spacing={1}>
                                {picked.map(({ revision, value }) => (
                                <Box key={revision.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                    {revision.revision_no > 1 && (
                                    <Chip size="small" label={`第${revision.revision_no}版`} sx={{ mt: "2px" }} />
                                    )}
                                    <Typography>{value ?? "—"}</Typography>
                                </Box>
                                ))}
                            </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                );
            }

            // 通常フィールド（revision差分表示）
            const label = (field as any).label as string | undefined;

            if (!name) return null;

            const picked = pickChangedRevisionsForField(revisionsAsc, name, includeFirstRevision)

            const isUnchanged = includeFirstRevision ? picked.length <= 1 : picked.length === 0;
            if (hideUnchangedFields && isUnchanged) return null;

            return (
                <Grid key={key} size={gridSize}>
                    <Paper sx={{ p: 2 }} variant="outlined">
                        <Stack spacing={1} sx={{ p: 1 }}>
                            {label && <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>}

                            <Stack spacing={1}>
                                {picked.map(({ revision, value }) => (
                                    <Box key={revision.id}>
                                        {type === "file"
                                            ? (
                                                <UploadedFileList
                                                    attachments={revision.attachments ?? []}
                                                    subtitle={revision.revision_no!==1 && <Chip label={`改訂${revision.revision_no}版`} color="warning" variant="outlined" size="small" />}
                                                    fetchUrl={"/api/apply/attachments/signed-urls"}
                                                    onRemove={() => {}}
                                                    />
                                            ):
                                            (
                                                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                                    {
                                                        revision.revision_no>1 &&
                                                        <Chip
                                                            size="small"
                                                            label={`第${revision.revision_no}版 ${revision.action ? `・${revision.action}` : ""}`}
                                                            sx={{ mt: "2px" }}
                                                            />
                                                    }
                                                    <Box sx={{ flex: 1 }}>
                                                        {/* <Typography variant="caption" color="text.secondary">
                                                            {toJaDateTime(revision.created_at)}
                                                        </Typography> */}
                                                        <Box sx={{ mt: 0.25 }}>
                                                            {fmt({ field, value, latestPayload })}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            )
                                        }
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            );
        },
        [
            fmt,
            hideUnchangedFields,
            includeFirstRevision,
            latestPayload,
            revisionsAsc,
            slots,
        ]
    );

    if (!revisionsAsc.length) return null;

    return (
        <Accordion
            defaultExpanded
            sx={{ width: "100%" }}
            >
            <AccordionSummary
                expandIcon={
                    <ArrowDropDownIcon
                        sx={{ color: "success.contrastText" }}
                    />}
                className={`bg-gradient-to-b from-success-dark via-success-main to-success-light`}
                sx={{
                    color: "success.contrastText",
                    fontWeight: "bold",
                    minHeight: "48px!important",
                }}
                >
                申請書
            </AccordionSummary>
            <AccordionDetails sx={{ border: "1px solid", borderColor: "divider" }}>
                <Grid container spacing={1}>
                    {created_at &&
                        <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Typography style={{ fontSize: "0.8rem" }} color="text.secondary">申請日: {format(created_at, "yyyy/MM/dd")}</Typography>
                        </Grid>
                    }

                    {fields
                        .map((f, idx) => {
                            const key = `root.${idx}.${(f as any).type}-${(f as any).name ?? (f as any).slotKey ?? idx}`;
                            return renderNode(f, key);
                        })
                        .filter(Boolean)}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
}
