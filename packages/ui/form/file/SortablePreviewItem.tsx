"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardMedia, CardContent, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import DragHandleIcon from "@mui/icons-material/DragHandle";

type Preview = {
    url: string;
    type: "image" | "pdf";
    name: string;
    href?: string
};

export default function SortablePreviewItem({
    id,
    preview,
    index,
    onRemove,
    onOpenLightbox,
}: {
    id: string;
    preview: Preview;
    index: number;
    onRemove: (i: number) => void;
    onOpenLightbox: (i: number) => void;
}) {
    const sortable = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        cursor: "grab",
    };

    return (
        <div
            ref={sortable.setNodeRef}
            style={style}
            {...sortable.attributes}
            {...sortable.listeners}
            >
            <Card
                variant="outlined"
                sx={{
                    position: "relative",
                    mb: 2, overflow: "visible",
                }}
                >
                {/* 並び替えハンドル */}
                {/* <IconButton
                    sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        bgcolor: "rgba(0,0,0,0.4)",
                        color: "#fff",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                    {...sortable.listeners}
                    {...sortable.attributes}
                >
                    <DragHandleIcon fontSize="small" />
                </IconButton> */}

                {/* 削除ボタン */}
                <IconButton
                    size="small"
                    sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "rgba(255,0,0,1)",
                        color: "#fff",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <CardMedia
                    component="img"
                    image={preview.url}
                    sx={{ height: 120, objectFit: "cover" }}
                    onClick={() => onOpenLightbox(index)}
                />
                <CardContent>
                    <Typography variant="body2">{preview.name}</Typography>
                </CardContent>
            </Card>
        </div>
    );
}
