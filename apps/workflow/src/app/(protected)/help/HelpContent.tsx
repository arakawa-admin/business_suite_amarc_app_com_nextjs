"use client";

import { Box, Typography } from "@mui/material";
import { helpCategories } from "./helpData";

export default function HelpContent({ articleId }: { articleId: string }) {
    const findItem = () => {
        for (const c of helpCategories) {
            const item = c.items.find((i) => i.id === articleId);
            if (item) return item;
        }
        return null;
    };

    const article = findItem();

    if (!article) {
        return <Typography>内容が選択されていません。</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {article.title}
            </Typography>
            <Box
                sx={{
                    "& h3": { fontSize: 20, mt: 2, mb: 1 },
                    "& p": { mb: 1 },
                    whiteSpace: "pre-wrap"
                }}
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </Box>
    );
}
