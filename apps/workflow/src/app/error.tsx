"use client";
import { Button, Link } from '@mui/material';

export default function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                color: "red",
            }}
            >
            <p
                style={{
                    fontWeight: "bold",
                    fontSize: "8rem",
                    lineHeight: "1",
                }}
                >
                error
            </p>
            <p
                style={{
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                    lineHeight: "1",
                    margin: "8px 0",
                }}
                >
                エラーが発生しました。
            </p>
            <div
                style={{
                    marginTop: "2em",
                }}
                >
                <Link
                    href="/"
                    >
                    <Button
                        variant="contained"
                        color="error"
                        size='large'
                        >
                        ホームに戻る
                    </Button>
                </Link>
            </div>
        </div>
    )
}
