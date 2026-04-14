import {
    Login,
    Dashboard,
    ContactSupport,
    Assignment,
    Check,
    Gavel,
    Mail,
} from "@mui/icons-material";

import type { ReactNode } from "react";
export const categoryIcons: Record<string, ReactNode> = {
    "ログイン": <Login />,
    "ダッシュボード": <Dashboard />,
    "顧客問合せ受付": <ContactSupport />,
    "進捗情報(営業部)": <Assignment />,
    "段取り情報": <Gavel />,
    "対応結果情報": <Check />,
    "通知": <Mail />,
};
