import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

export type HelpArticle = {
    id: string;
    title: string;
    category: string;
    content: string;
};

// 開発環境かプロダクション環境かを判定
const isDevelopment = process.env.NODE_ENV === "development";

// プロダクション用のキャッシュ
let cachedArticles: HelpArticle[] | null = null;

export async function getAllHelpArticles() {
    // プロダクション環境でキャッシュがあれば返す
    if (!isDevelopment && cachedArticles) {
        return cachedArticles;
    }

    try {
        // contentディレクトリへの絶対パスを取得
        const baseDir = path.join(process.cwd(), "src", "app", "(protected)", "help", "content");

        // ディレクトリの存在確認
        if (!fs.existsSync(baseDir)) {
            console.error(`Content directory not found: ${baseDir}`);
            return [];
        }

        const categories = fs.readdirSync(baseDir);
        const articles: HelpArticle[] = [];

        for (const category of categories) {
            const catDir = path.join(baseDir, category);

            // ディレクトリかどうかチェック
            const stats = fs.statSync(catDir);
            if (!stats.isDirectory()) continue;

            const files = fs.readdirSync(catDir).filter(file => 
                file.endsWith('.md') || file.endsWith('.mdx')
            );

            for (const file of files) {
                const fullPath = path.join(catDir, file);
                const raw = fs.readFileSync(fullPath, "utf8");

                const { content, data } = matter(raw);
                articles.push({
                    id: data.id || file.replace(/\.mdx?$/, ''),
                    title: data.title || 'Untitled',
                    category: data.category || category,
                    content,
                });
            }
        }

        // プロダクション環境ではキャッシュ
        if (!isDevelopment) {
            cachedArticles = articles;
        }

        return articles;
    } catch (error) {
        console.error("Error loading help articles:", error);
        return [];
    }
}

import { mdxComponents } from "./mdxComponents";

export async function getHelpArticleById(id: string) {
    const articles = await getAllHelpArticles();
    const target = articles.find((a) => a.id === id);
    if (!target) return null;

    try {
        const { content } = await compileMDX({
            source: target.content,
            components: mdxComponents,
        });
        return { ...target, compiled: content };
    } catch (error) {
        console.error(`Error compiling MDX for article ${id}:`, error);
        return null;
    }
}
