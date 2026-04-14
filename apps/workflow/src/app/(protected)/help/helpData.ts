export type HelpItem = {
    id: string;
    title: string;
    content: string;
};

export type HelpCategory = {
    id: string;
    title: string;
    items: HelpItem[];
};

export const helpCategories: HelpCategory[] = [
    {
        id: "login",
        title: "ログイン",
        items: [
            {
                id: "googleOAuth",
                title: "Google OAuth でログイン",
                content: `
                    ### Google OAuth でログインする

                    1. ログインページへアクセス  
                    2. 「Googleでログイン」ボタンを押す  
                    3. アカウントを選択するとログイン完了

                    ※ Google アカウントが社内メールと紐づいている必要があります。
                `,
            },
        ],
    },

    {
        id: "dashboard",
        title: "ダッシュボード",
        items: [
            {
                id: "dashboardOverview",
                title: "ダッシュボードについて",
                content: `
                ### ダッシュボードとは？

                - システムの全体状況を確認できます
                - 問合せ数 / 対応中 / 完了状況などが表示されます
                `,
            },
        ],
    },

    {
        id: "inquiry",
        title: "顧客問合せ受付",
        items: [
            { id: "inquiryCreate", title: "投稿", content: "### 問合せ投稿\n\n1. 情報を入力\n2. 必要なファイルを添付\n3. 送信ボタンを押すと登録されます。" },
            { id: "inquiryEdit", title: "編集", content: "### 問合せ編集\n\n登録済み問合せを更新できます。" },
            { id: "inquiryDelete", title: "削除", content: "### 問合せ削除\n\n削除すると元に戻りません。" },
        ],
    },

    {
        id: "progress",
        title: "進捗情報(営業部)",
        items: [
            { id: "progressCreate", title: "投稿", content: "### 進捗情報の投稿方法" },
            { id: "progressEdit", title: "編集", content: "### 進捗情報の編集方法" },
            { id: "progressDelete", title: "削除", content: "### 進捗情報の削除方法" },
        ],
    },

    {
        id: "arrangement",
        title: "受注情報(営業部)",
        items: [
            { id: "arrangementCreate", title: "投稿", content: "### 受注情報の投稿方法" },
            { id: "arrangementEdit", title: "編集", content: "### 受注情報の編集方法" },
            { id: "arrangementDelete", title: "削除", content: "### 受注情報の削除方法" },
        ],
    },

    {
        id: "result",
        title: "対応結果情報",
        items: [
            { id: "resultCreate", title: "投稿", content: "### 対応結果の投稿方法" },
            { id: "resultEdit", title: "編集", content: "### 対応結果の編集方法" },
            { id: "resultDelete", title: "削除", content: "### 対応結果の削除方法" },
        ],
    },
];
