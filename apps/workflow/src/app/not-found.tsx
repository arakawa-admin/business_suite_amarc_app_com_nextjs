import Link from 'next/link'

export default function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                color: "#aaa",
            }}
            >
            <p
                style={{
                    fontWeight: "bold",
                    fontSize: "12rem",
                    lineHeight: "1",
                }}
                >
                404
            </p>
            <p
                style={{
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                    lineHeight: "1",
                }}
                >
                PAGE NOT FOUND
            </p>
            <p
                style={{
                    margin: "2em 0",
                }}
                >
                お探しのページが見つかりません。</p>
            <div
                style={{
                    marginTop: "1em",
                }}
                >
                <Link
                    href="/"
                    style={{
                        color: "#aaa",
                        border: "1px solid #aaa",
                        borderRadius: "16px",
                        padding: "1em 2em",
                    }}
                    >ホームに戻る</Link>
            </div>
        </div>
    )
}
