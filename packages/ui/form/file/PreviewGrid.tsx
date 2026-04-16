"use client";

import { useState, useMemo } from "react";
import { Box, Grid, Typography, Card, CardMedia, Button, CardActions, IconButton } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from "@mui/icons-material/Close";
import PreviewLightbox from "./PreviewLightbox";
import type { UploadPreviewItem } from "./types";

type Props = {
    previews: UploadPreviewItem[];
    onRemove?: (id: string) => void;
    removable?: boolean;
};
export default function PreviewGrid({
    previews,
    onRemove,
    removable=false,
}: Props) {

    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const imagePreviews = useMemo(
        () => previews.filter((item) => item.type === "image"),
        [previews],
    );

    const handleOpen = (clickedIndex: number) => {
        const clicked = previews[clickedIndex];

        if (!clicked) {
            return;
        }

        if (clicked.type === "pdf") {
            window.open(clicked.viewUrl, "_blank", "noopener,noreferrer");
            return;
        }

        const imageIndex = imagePreviews.findIndex((item) => item.id === clicked.id);
        if (imageIndex < 0) {
            return;
        }

        setIndex(imageIndex);
        setOpen(true);
    };

    return (
        <>
            <Grid
                container
                spacing={2}
                mt={2}
                sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    p: 1
                }}
                >
                {previews.map((p, i) => {
                    const previewSrc = p.thumbnailUrl || p.viewUrl;
                    const hasThumbnail = !!previewSrc;

                    return (
                        <Grid
                            size={{ xs: 6, sm: 4, md: 3 }}
                            key={p.id}
                            >
                            <Card
                                variant="outlined"
                                sx={{
                                    position: "relative",
                                    cursor: "pointer",
                                    height: "100%",
                                }}
                                onClick={() => handleOpen(i)}
                                >
                                {removable && onRemove ? (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            bgcolor: "rgba(0,0,0,0.5)",
                                            color: "#fff",
                                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Lightbox が開かないようにする
                                            onRemove(p.id);
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                ) : null}

                                {hasThumbnail ? (
                                    <CardMedia
                                        component="img"
                                        height="194"
                                        sx={{
                                            maxHeight: 120,
                                            width: "100%",
                                            objectFit: "cover",
                                            objectPosition: "center",
                                        }}
                                        image={previewSrc}
                                        alt={p.name}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: 120,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "grey.100",
                                            px: 2,
                                            }}
                                        >
                                        <Typography variant="body2" color="text.secondary">
                                        {p.type === "pdf" ? "PDF" : "画像"}
                                        </Typography>
                                    </Box>
                                )}
                                <CardActions
                                    sx={{
                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    }}
                                    disableSpacing
                                    >
                                    <Typography
                                        variant="body2"
                                        component={"span"}
                                        sx={{
                                            wordBreak: "break-all",
                                            lineHeight: 1.4,
                                        }}
                                        >
                                        {p.name}
                                    </Typography>
                                    {p.type === "pdf" &&
                                        <Button
                                            variant="text"
                                            size="small"
                                            sx={{ ml: 1, p: 0, lineHeight: 1 }}
                                            endIcon={<OpenInNewIcon sx={{ width: 14, height: 14 }} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(p.viewUrl, "_blank", "noopener,noreferrer");
                                            }}
                                            >
                                            PDFを開く
                                        </Button>
                                    }
                                </CardActions>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <PreviewLightbox
                open={open}
                onClose={() => setOpen(false)}
                previews={imagePreviews.map((item) => ({
                    url: item.viewUrl,
                    type: "image" as const,
                    name: item.name,
                    href: item.viewUrl,
                }))}
                index={index}
                setIndex={setIndex}
            />
        </>
    );
}
