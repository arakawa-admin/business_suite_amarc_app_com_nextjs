import { getAllHelpArticles } from "./helpLoader";
import HelpSidebar from "./HelpSidebar";
import SearchBox from "./SearchBox";
import { Toolbar } from "@mui/material";

export default async function HelpLayout({ children }: { children: React.ReactNode }) {

    try {
        const articles = await getAllHelpArticles();
        const header = 64;
        const margin = 16;

        return (
            <div
                className="bg-stone-50"
                style={{
                    minHeight: "100vh",
                }}
                >
                <Toolbar
                    sx={{
                        backgroundColor: "primary.main",
                        color: "success.contrastText",
                        fontWeight: "bold",
                        minHeight: "48px!important",
                    }}
                    >
                    ヘルプページ
                </Toolbar>
                <div
                    style={{
                        display: "flex",
                        marginTop: 8,
                    }}>
                    {/* 左サイドバー */}
                    <div
                        style={{
                            width: 280,
                            flexShrink: 0,
                            position: "sticky",
                            top: `calc(${header} + ${margin})`,
                            alignSelf: "flex-start",
                            height: "100vh",
                            overflowY: "auto",
                            paddingBottom: 20, // スクロール余白
                        }}>
                        <SearchBox articles={articles} />
                        <HelpSidebar articles={articles} />
                    </div>

                    {/* 右側：各ページの内容 */}
                    <div
                        style={{
                            flex: 1,
                            padding: 20,
                            minHeight: "100vh",
                            backgroundColor: "white",
                        }}
                        >
                        {children}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to load help articles:", error);
    }

}
