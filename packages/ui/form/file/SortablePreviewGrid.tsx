"use client";
import { Grid } from "@mui/material";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from "@dnd-kit/sortable";

import SortablePreviewItem from "./SortablePreviewItem";

type Preview = {
    url: string;
    type: "image" | "pdf";
    name: string;
    href?: string;
};

export default function SortablePreviewGrid({
    previews,
    type="rect",
    size={ xs: 6, sm: 4, md: 3 },
    onChangeOrder,
    onRemove,
    onOpenLightbox,
}: {
    previews: Preview[];
    type?: "rect" | "vertical";
    size?: object|number;
    onChangeOrder: (newOrder: Preview[]) => void;
    onRemove: (index: number) => void;
    onOpenLightbox: (index: number) => void;
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 },
        })
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                    const oldIndex = previews.findIndex(
                        (p) => p.url === active.id
                    );
                    const newIndex = previews.findIndex(
                        (p) => p.url === over.id
                    );

                    const newOrder = arrayMove(previews, oldIndex, newIndex);
                    onChangeOrder(newOrder);
                }
            }}
        >
        {type === "rect" && (
            <SortableContext
                items={previews.map((p) => p.url)}
                strategy={rectSortingStrategy}
                >
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
                        <Grid key={p.url} size={size}>
                            <SortablePreviewItem
                                key={p.url}
                                id={p.url}
                                preview={p}
                                index={i}
                                onRemove={onRemove}
                                onOpenLightbox={onOpenLightbox}
                            />
                        </Grid>
                    ))}
                </Grid>
            </SortableContext>
        )}
        {type === "vertical" && (
            <SortableContext
                items={previews.map((p) => p.url)}
                strategy={verticalListSortingStrategy}
                >
                {previews.map((p, i) => (
                    <SortablePreviewItem
                        key={p.url}
                        id={p.url}
                        preview={p}
                        index={i}
                        onRemove={onRemove}
                        onOpenLightbox={onOpenLightbox}
                    />
                ))}
            </SortableContext>
        )}
    </DndContext>
    );
}
