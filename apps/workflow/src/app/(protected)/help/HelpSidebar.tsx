"use client";

import {
    List,
    ListItemButton,
    ListItemText,
    Collapse,
    Divider,
    ListItemIcon,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryIcons } from "./icons";
import type { HelpArticle } from "./helpLoader";

export default function HelpSidebar({
    // categories,
    articles
}: {
    // categories: any,
    articles: HelpArticle[]
}) {
    const router = useRouter();
    const [open, setOpen] = useState<string | null>(null);

    // カテゴリごとに整形
    const categories = Object.values(
        articles.reduce((acc: any, a: HelpArticle) => {
            if (!acc[a.category]) {
                acc[a.category] = {
                    id: a.category,
                    title: a.category,
                    items: [],
                };
            }
            acc[a.category].items.push(a);
            return acc;
        }, {})
    );

    return (
        <List sx={{ width: "98%" }}>
            {categories.map((category: any) => (
                <div key={category.id}>
                    {/* 親カテゴリ */}
                    <ListItemButton
                        onClick={() => setOpen(open === category.id ? null : category.id)}
                        >
                        <ListItemIcon>
                            {categoryIcons[category.id] ?? null}
                        </ListItemIcon>
                        <ListItemText
                            primary={category.title}
                            slotProps={{
                                primary: {
                                    sx: {
                                        fontWeight: "bold",
                                        fontSize: "0.9rem",
                                    }
                                }
                            }}
                            />
                        {open === category.id ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>

                    {/* 子記事リスト */}
                    <Collapse in={open === category.id}>
                        {category.items.map((item: HelpArticle, i: number) => (
                            <ListItemButton
                                key={`${item.id}-${i}`}
                                sx={{ pl: 10 }}
                                onClick={() => router.push(`/help/${item.id}`)}
                                >
                                <ListItemText
                                    primary={item.title}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                fontSize: "0.9rem",
                                            }
                                        }
                                    }}
                                    />
                            </ListItemButton>
                        ))}
                    </Collapse>

                    <Divider />
                </div>
            ))}
        </List>
    );
}
