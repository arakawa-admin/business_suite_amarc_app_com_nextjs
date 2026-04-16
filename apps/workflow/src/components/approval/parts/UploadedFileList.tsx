"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Box,
    IconButton,
    Card,
    CardMedia,
    Typography,
    Grid,
    Paper,
    Link,
    Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import PreviewLightbox from "@ui/form/file/PreviewLightbox";

import { AttachmentType } from "@/schemas/approval/attachmentSchema";

export default function UploadedFileList({
    attachments,
    canRemove=false,
    subtitle,
    fetchUrl,
    size={ xs: 6, sm: 4, md: 3 },
    onRemove,
}: {
    attachments: AttachmentType[];
    canRemove?: boolean;
    subtitle?: React.ReactNode;
    fetchUrl: string;
    size?: object|number;
    onRemove: (id: string) => void;
}) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [index, setIndex] = useState(0);

    type Signed = { url: string; thumbnailUrl: string | null; contentType?: string };
    const [signedUrls, setSignedUrls] = useState<Record<string, Signed>>({});
    const attachmentIds = useMemo(() => attachments.map((a) => a.id), [attachments]);

    useEffect(() => {
        if (attachmentIds.length === 0) return;

        let cancelled = false;

        (async () => {
            const res = await fetch(fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attachmentIds }),
            });
            if (!res.ok) return;
            const json = (await res.json()) as { urls: Record<string, Signed> };
            if (!cancelled) setSignedUrls(json.urls ?? {});
        })();

        return () => {
            cancelled = true;
        };
    }, [fetchUrl, attachmentIds]);


    if(attachments.length === 0) return

    const resolveFileUrl = (atts: AttachmentType) => signedUrls[atts.id]?.url || "";
    const resolvePreviewUrl = (atts: AttachmentType) => signedUrls[atts.id]?.thumbnailUrl || signedUrls[atts.id]?.url || "";

    return (
        <Paper variant="outlined" sx={{ py: 1, px: 2, borderRadius: 2 }}>
            {/* <Stack direction={"row"} spacing={1} alignItems={"center"} sx={{ m: 1 }}>
                <Typography component={"div"} variant="caption" sx={{ color: "text.secondary" }}>
                    添付ファイル
                </Typography>
            </Stack> */}
            {subtitle}

            <Grid container spacing={2} mt={1}>
                {attachments.map((atts, i) => {
                    // const url = resolveUrl(atts);
                    return(
                        <Grid size={size} key={atts.id}>
                            <Card
                                sx={{ cursor: "pointer", position: "relative" }}
                                onClick={() => {
                                    setIndex(i);
                                    setLightboxOpen(true);
                                }}
                                >
                                {resolveFileUrl(atts)?
                                <CardMedia
                                        component="img"
                                        sx={{
                                            height: 130,
                                            objectFit: "cover",
                                        }}
                                        image={resolvePreviewUrl(atts)}
                                        alt={atts.filename}
                                    />
                                    : <Skeleton variant="rounded" height={"3em"} animation="wave" />
                                }
                            </Card>

                            <Box
                                sx={{
                                    display: "flex",
                                    mt: 0.5,
                                    alignItems: "center",
                                }}
                                >
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                        component={"span"}
                                        fontSize="0.8rem"
                                        >
                                        {atts.filename}
                                    </Typography>

                                    {atts.content_type === "application/pdf" && (
                                        <Link
                                            underline="hover"
                                            fontSize="small"
                                            sx={{ ml: 1, cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(resolveFileUrl(atts), "_blank");
                                            }}
                                            >
                                            PDFを開く<OpenInNewIcon sx={{ ml: 0, width: 12, height: 12 }} />
                                        </Link>
                                    )}
                                </Box>
                                {canRemove &&
                                    <Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => onRemove(atts.id)}
                                        >
                                            <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box>
                                }
                            </Box>
                        </Grid>
                    )
                })}
            </Grid>

            <PreviewLightbox
                open={lightboxOpen}
                index={index}
                setIndex={setIndex}
                previews={attachments.map((a) => ({
                    url: a.content_type === "application/pdf" ? resolvePreviewUrl(a) : resolveFileUrl(a) ?? "",
                    type: a.content_type === "application/pdf" ? "pdf" : "image",
                    name: a.filename,
                }))}
                onClose={() => setLightboxOpen(false)}
            />
        </Paper>
    );
}
