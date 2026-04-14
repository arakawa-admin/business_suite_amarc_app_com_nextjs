"use client";

import { useState } from "react";
import { Grid, Typography, Card, CardMedia, Button, Link, CardActions, IconButton } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from "@mui/icons-material/Close";
import PreviewLightbox from "@/components/common/parts/PreviewLightbox";

type Preview = {
    url: string;
    type: "image" | "pdf";
    name: string;
    href?: string
};

export default function PreviewGrid({
    previews,
    onRemove
}: {
    previews: Preview[],
    onRemove: (index: number) => void;
}) {

    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const handleOpen = (i: number) => {
        setIndex(i);
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
                {previews.map((p, i) => (
                    <Grid
                        size={{ xs: 6, sm: 4, md: 3 }}
                        key={p.url}
                        onClick={() => handleOpen(i)}
                        style={{
                            cursor: "pointer",
                        }}
                        >
                        <Card variant="outlined">
                            {/* 削除ボタン */}
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
                                    onRemove(i);
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <CardMedia
                                component="img"
                                height="194"
                                sx={{
                                    maxHeight: 120,
                                    width: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center",
                                }}
                                image={p.url}
                                alt={p.name}
                            />
                            <CardActions
                                sx={{
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                }}
                                disableSpacing
                                >
                                <Typography variant="body2">
                                    {p.name}
                                    {p.type === "pdf" &&
                                        <Link
                                            underline="hover"
                                            fontSize="small"
                                            color="inherit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(p.href, "_blank");
                                            }}
                                            >
                                            <Button
                                                endIcon={<OpenInNewIcon sx={{ ml: 0, width: 12, height: 12 }} />}
                                                size="small"
                                                sx={{ ml: 1 }}
                                                >
                                                PDFを開く
                                            </Button>
                                        </Link>
                                    }
                                </Typography>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <PreviewLightbox
                open={open}
                onClose={() => setOpen(false)}
                previews={previews}
                index={index}
                setIndex={setIndex}
            />
        </>
    );
}
