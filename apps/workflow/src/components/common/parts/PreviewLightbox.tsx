"use client";

import { Modal, Fade, Box, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";
import Image from "next/image";

type Preview = { url: string; type: "image" | "pdf"; name: string };

export default function PreviewLightbox({
    open,
    onClose,
    previews,
    index,
    setIndex,
}: {
    open: boolean;
    onClose: () => void;
    previews: Preview[];
    index: number;
    setIndex: (i: number) => void;
}) {
    if (!previews.length) return null;

    const current = previews[index];

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1);
    };

    const handleNext = () => {
        if (index < previews.length - 1) setIndex(index + 1);
    };

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition>
            <Fade in={open}>
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        bgcolor: "rgba(0,0,0,0.85)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "none",
                        overflow: "hidden",
                    }}
                >
                    {/* 閉じるボタン */}
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "fixed",
                            top: 20,
                            right: 20,
                            color: "#fff",
                        }}
                    >
                        <Close fontSize="large" />
                    </IconButton>

                    {/* 左矢印 */}
                    {index > 0 && (
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: "fixed",
                                left: 20,
                                color: "#fff",
                            }}
                        >
                            <ArrowBack fontSize="large" />
                        </IconButton>
                    )}

                    {/* 右矢印 */}
                    {index < previews.length - 1 && (
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: "fixed",
                                right: 20,
                                color: "#fff",
                            }}
                        >
                            <ArrowForward fontSize="large" />
                        </IconButton>
                    )}

                    {/* 中央プレビュー */}
                    <Box sx={{ maxWidth: "90vw", maxHeight: "90vh" }}>
                        {current.type === "image" ? (
                            <Image
                                src={current.url}
                                alt={current.name}
                                width={1200}
                                height={1200}
                                style={{
                                    maxWidth: "90vw",
                                    maxHeight: "90vh",
                                    objectFit: "contain",
                                    borderRadius: 8,
                                }}
                            />
                        ) : (
                            // PDF の場合
                            <Box
                                sx={{
                                    width: "60vw",
                                    height: "60vh",
                                    bgcolor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 4,
                                }}
                            >
                                <Image
                                    src={current.url}
                                    alt={current.name}
                                    width={800}
                                    height={1000}
                                    style={{
                                        maxWidth: "90%",
                                        maxHeight: "90%",
                                        objectFit: "contain",
                                        borderRadius: 8,
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
