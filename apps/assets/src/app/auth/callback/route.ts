import { NextResponse } from "next/server";
import { createClient } from "@supabase-shared/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    let next = searchParams.get("next") ?? "/";

    if (!next.startsWith("/")) {
        next = "/";
    }

    // Cloudflare環境での正しいドメイン取得
    const cfRay = request.headers.get("cf-ray");
    const isCloudflare = cfRay !== null;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = request.headers.get("host");

    // ベースURL決定
    let baseUrl: string;
    if (isCloudflare || host === "assets.amarc-app.com") {
        baseUrl = "https://assets.amarc-app.com";
    } else if (forwardedHost && forwardedProto) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
    } else if (host && !host.includes("localhost")) {
        baseUrl = `https://${host}`;
    } else {
        baseUrl = "https://assets.amarc-app.com";
    }

    const redirectUrl = `${baseUrl}${next}`;

    // User-Agentチェック（iOS Safari判定）
    const userAgent = request.headers.get("user-agent") || "";
    const isIOSSafari =
        /iPhone|iPad/.test(userAgent) &&
        /Safari/.test(userAgent) &&
        !/Chrome|CriOS|FxiOS/.test(userAgent);

    if (error) {
        const errorUrl = `${baseUrl}/auth/auth-code-error?error=${error}`;
        if (isIOSSafari) {
            return new NextResponse(createRedirectHTML(errorUrl), {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            });
        }
        return NextResponse.redirect(errorUrl);
    }

    if (code) {
        try {
            const supabase = await createClient();
            const { data, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                console.error("Exchange error:", exchangeError);
                const errorUrl = `${baseUrl}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`;
                if (isIOSSafari) {
                    return new NextResponse(createRedirectHTML(errorUrl), {
                        status: 200,
                        headers: {
                            "Content-Type": "text/html; charset=utf-8",
                            "Cache-Control":
                                "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            Expires: "0",
                        },
                    });
                }
                return NextResponse.redirect(errorUrl);
            }

            if (!data.session) {
                const errorUrl = `${baseUrl}/auth/auth-code-error?error=no_session`;
                if (isIOSSafari) {
                    return new NextResponse(createRedirectHTML(errorUrl), {
                        status: 200,
                        headers: {
                            "Content-Type": "text/html; charset=utf-8",
                            "Cache-Control":
                                "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            Expires: "0",
                        },
                    });
                }
                return NextResponse.redirect(errorUrl);
            }

            // 成功時のリダイレクト
            if (isIOSSafari) {
                // iOS Safari用：HTMLでリダイレクト
                return new NextResponse(createRedirectHTML(redirectUrl), {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html; charset=utf-8",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                });
            } else {
                // その他ブラウザ用：通常のリダイレクト
                const response = NextResponse.redirect(redirectUrl);
                response.headers.set(
                    "Cache-Control",
                    "no-cache, no-store, must-revalidate"
                );
                response.headers.set("Pragma", "no-cache");
                response.headers.set("Expires", "0");
                if (isCloudflare) {
                    response.headers.set("CF-Cache-Status", "BYPASS");
                }
                return response;
            }
        } catch (err) {
            console.error("Callback error:", err);
            const errorUrl = `${baseUrl}/auth/auth-code-error?error=callback_error`;
            if (isIOSSafari) {
                return new NextResponse(createRedirectHTML(errorUrl), {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html; charset=utf-8",
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                    },
                });
            }
            return NextResponse.redirect(errorUrl);
        }
    }

    const errorUrl = `${baseUrl}/auth/auth-code-error?error=no_code`;
    if (isIOSSafari) {
        return new NextResponse(createRedirectHTML(errorUrl), {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    }
    return NextResponse.redirect(errorUrl);
}

// iOS Safari用のHTMLリダイレクト生成関数
function createRedirectHTML(url: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>リダイレクト中...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top: 4px solid #007AFF;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            margin-top: 20px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div>
        <div class="spinner"></div>
        <div class="message">リダイレクトしています...</div>
    </div>
    <script>
        // 即座にリダイレクト実行
        window.location.replace('${url}');

        // フォールバック：1秒後にもう一度試行
        setTimeout(function() {
            if (window.location.href !== '${url}') {
                window.location.href = '${url}';
            }
        }, 1000);
    </script>
</body>
</html>`;
}
