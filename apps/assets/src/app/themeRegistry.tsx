"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({});

function createEmotionCache() {
    return createCache({ key: "mui", prepend: true });
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const [{ cache, flush }] = React.useState(() => {
        const cache = createEmotionCache();
        cache.compat = true;

        let inserted: string[] = [];

        // ✅ cache.insert の引数型をそのまま流用（any禁止＆spreadエラー回避）
        type InsertArgs = Parameters<typeof cache.insert>;
        const prevInsert = cache.insert.bind(cache);

        cache.insert = (...args: InsertArgs) => {
            const serialized = args[1]; // Emotionのinsertの第2引数が serialized
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name);
            }
            return prevInsert(...args);
        };

        const flush = () => {
            const prev = inserted;
            inserted = [];
            return prev;
        };

        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const names = flush();
        if (names.length === 0) return null;

        let styles = "";
        for (const name of names) {
            styles += cache.inserted[name];
        }

        return (
            <style
                data-emotion={`mui ${names.join(" ")}`}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: styles }}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </CacheProvider>
    );
}
