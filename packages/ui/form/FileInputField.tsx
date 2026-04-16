"use client";
import { useRef } from "react";
import {
    FormControl,
    FormHelperText,
    Paper,
    Typography,
    Stack,
    FormLabel,
    Box
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useState } from "react";

import DropZone from "./file/DropZone";
import FilePicker from "./file/FilePicker";
import SortablePreviewGrid from "./file/SortablePreviewGrid";
import PreviewLightbox from "@packages/ui/form/file/PreviewLightbox";

import { compressImage } from "../../lib/file/compressImage";
import { compressPdf, generatePdfThumb, generateImageThumb } from "../../lib/file/pdfToThumbnail";

type Attachment = {
    file: File,
    thumbnail: File,
    name: string,
    type: "pdf" | "image",
}

type Preview = {
    url: string;
    type: "image" | "pdf";
    name: string;
    href?: string; // pdf
};

type Props = {
    name: string;
    label?: string;
    multiple?: boolean;
    accept?: string;
    maxFiles?: number;
    maxSizeMB?: number;
    sx?: object;
    canDrop?: boolean;
    disabled?: boolean;
    previewSize?: object|number;
    onChange?: (files: Attachment[]) => void;
};

export default function FileInputField({
    name,
    label,
    multiple = true,
    accept = "image/*,.pdf",
    maxFiles = 5,
    maxSizeMB = 5,
    sx = { mt: 0 },
    canDrop=true,
    disabled = false,
    previewSize,
    onChange,
}: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const [_attachments, setAttachments] = useState<Attachment[]>([]);
    const [previews, setPreviews] = useState<Preview[]>([]);
    const [open, setOpen] = useState(false);   // ★ Lightbox OPEN 状態
    const [index, setIndex] = useState(0);     // ★ どの画像を表示するか

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /** 🔥 共通処理（DropZoneもFilePickerもこれを通る） */
    const processFiles = async (files: File[]) => {
        const results: Attachment[] = [];
        const previewItems: Preview[] = [];

        for (const file of files) {
            // サイズ制限
            if (file.size > maxSizeMB * 1024 * 1024) continue;
            if (file.type.startsWith("image/")) {
                const compressed = await compressImage(file);
                const thumbnail = await generateImageThumb(compressed);

                results.push({
                    file: compressed,
                    thumbnail,
                    name: file.name,
                    type: "image",
                });

                previewItems.push({
                    url: URL.createObjectURL(file),
                    type: "image",
                    name: file.name,
                });
            } else if (file.type === "application/pdf") {
                const compressed = await compressPdf(file);
                const thumbnail = await generatePdfThumb(file);

                results.push({
                    file: compressed,
                    thumbnail,
                    name: file.name,
                    type: "pdf",
                });

                previewItems.push({
                    url: URL.createObjectURL(thumbnail),
                    type: "pdf",
                    name: file.name,
                    href: URL.createObjectURL(file),   // ←⭐ PDF 本体を Lightbox や外部タブで開く用
                });
            }
        }

        const limited = results.slice(0, maxFiles);

        setAttachments((prev) => {
            const merged = [...prev, ...results];
            const attachments = merged.slice(0, maxFiles);
            onChange?.(attachments);
            return attachments

        });
        setPreviews((prev) => {
            const merged = [...prev, ...previewItems];
            return merged.slice(0, maxFiles);
        });

        return limited;
    };

    return (
        <FormControl fullWidth error={!!errors[name]} sx={sx}>
            <Controller
                name={name}
                control={control}
                defaultValue={multiple ? [] : null}
                disabled={disabled}
                render={({ field, fieldState }) => (
                    <Box>
                        {label && <FormLabel sx={{ m: 1, fontSize: "0.9em" }}>{label}</FormLabel>}
                        <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                            <Stack spacing={1}>
                                {canDrop &&
                                    <DropZone
                                        onDropFiles={async (files) => {
                                            const processed = await processFiles(files);
                                            field.onChange(processed);
                                        }}
                                        onClickOpen={() => fileInputRef.current?.click()}
                                        disabled={previews.length >= maxFiles}
                                    />
                                }

                                {previews.length < maxFiles &&
                                    <FilePicker
                                        label={"ファイルを選択"}
                                        multiple={multiple}
                                        hasButton={!canDrop}
                                        accept={accept}
                                        inputRef={fileInputRef}
                                        onSelect={async (files) => {
                                            const processed = await processFiles(files);
                                            const mergedFiles = [
                                                ...(field.value ?? []),
                                                ...processed,
                                            ].slice(0, maxFiles);
                                            field.onChange(mergedFiles);
                                        }}
                                    />
                                }

                                <Typography variant="caption" sx={{ color: "text.secondary", textAlign: "right" }}>
                                    最大{maxFiles}ファイル (上限{maxSizeMB}MB/ファイル)
                                </Typography>
                            </Stack>

                            {previews.length > 0 && (
                                <SortablePreviewGrid
                                    previews={previews}
                                    size={previewSize}
                                    onChangeOrder={(newOrder) => {
                                        setPreviews(newOrder);

                                        // react-hook-form も並び順を同期
                                        field.onChange(
                                            newOrder.map((p) =>
                                                (field.value ?? []).find((f: File) => f.name === p.name)
                                            )
                                        );
                                    }}
                                    onRemove={(removeIndex) => {
                                        setPreviews((prev) => prev.filter((_, i) => i !== removeIndex));
                                        field.onChange(
                                            (field.value ?? []).filter((_: File, i: number) => i !== removeIndex)
                                        );
                                    }}
                                    onOpenLightbox={(i) => {
                                        setIndex(i);
                                        setOpen(true);
                                    }}
                                />
                            )}

                            <PreviewLightbox
                                open={open}
                                index={index}
                                setIndex={setIndex}
                                previews={previews}
                                onClose={() => setOpen(false)}
                                />

                            {fieldState.error && (
                                <FormHelperText sx={{ color: "error.main", fontWeight: "bold" }}>
                                    {fieldState.error.message}
                                </FormHelperText>
                            )}
                        </Paper>
                    </Box>
                )}
            />
        </FormControl>
    );
}
