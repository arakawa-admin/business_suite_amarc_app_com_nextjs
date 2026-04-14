import styles from "./page.module.scss";

import { getHelpArticleById } from "../helpLoader";

export default async function HelpArticlePage({ params }: any) {
    const { id } = await params;
    const article = await getHelpArticleById(id);

    if (!article) {
        return <div>記事が見つかりません</div>;
    }

    return (
        <div style={{ padding: 8 }}>
            <article className={styles.mdx}>
                {article.compiled}
            </article>
        </div>
    );
}
