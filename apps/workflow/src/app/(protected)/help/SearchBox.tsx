"use client";

import { TextField, List, ListItemButton, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useState } from "react";

import type { HelpArticle } from "./helpLoader";

export default function SearchBox({ articles }: { articles: HelpArticle[] }) {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const fuse = new Fuse(articles, {
        keys: ["title", "content"],
        threshold: 0.3,
    });

    const results = query ? fuse.search(query).map((r) => r.item) : [];

    return (
        <>
            <TextField
                fullWidth
                label="検索"
                value={query}
                sx={{ width: "98%" }}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <List>
                    {results.map((a) => (
                        <ListItemButton
                            key={a.id}
                            onClick={() => router.push(`/help/${a.id}`)}
                        >
                            <ListItemText primary={a.title} />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </>
    );
}
