import { createClient } from "@supabase-shared/server";
import { redirect } from "next/navigation";

import { AuthProvider } from "@contexts/AuthContext";

import ClientLayout from "./ClientLayout";

import type { MasterStaffType } from "@schemas/common/masterStaffSchema";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {

    // ** checkAuthUser ** //
    const supabase = await createClient();
    const common = supabase.schema("common");

    // ✅ Supabase推奨: getUser() を使用（サーバーで検証される）
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    // 認証エラーまたはユーザーが存在しない場合
    if (error || !authUser) {
        redirect("/login");
    }
    let user = null;
    let profile = null;

    // メールアドレスのドメインチェック
    if (authUser.email?.endsWith("@amarc.co.jp")) {
        const { data: loginUser } = await common
            .from("master_login_users")
            .select(
                `*,
                staffs:master_staffs(
                    *,
                    memberships:staff_departments(
                        *,
                        department:master_departments(*)
                    )
                )
            `)
            .eq("email", authUser.email)
            .maybeSingle();

        if (!loginUser) { redirect("/login"); }

        loginUser.staffs = loginUser.staffs.map((staff: MasterStaffType) => {
            const { memberships, ...rest } = staff;
            return {
                ...rest,
                department: memberships[0]?.department,
            }
        })

        user = loginUser;

        const staffList = loginUser.staffs

        // スタッフが登録されていない場合
        if (staffList.length === 0) {
            return (
                <div
                    style={{
                        textAlign: "center",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                    <div>
                        <h2>スタッフが登録されていません</h2>
                        <p>管理者に連絡してスタッフを登録してもらってください。</p>
                    </div>
                    <div
                        style={{
                            marginTop: "2rem",
                        }}
                        >
                        <a
                            className="bg-gradient-to-br from-primary-dark via-primary-main to-primary-light"
                            style={{
                                borderRadius: "4px",
                                padding: "1rem 2rem",
                                color: "white",
                                textDecoration: "none"
                            }}
                            href="/login"
                            >
                            再ログイン
                        </a>
                    </div>
                </div>
            );
        }

        // スタッフが1人だけの場合は自動選択
        if (staffList.length === 1) {
            profile = staffList[0];
        }
    } else {
        // @amarc.co.jp 以外のメールアドレスはブロック
        redirect("/login");
    }
    // ** checkAuthUser ** //

    return (
        <AuthProvider
            initialUser={user}
            initialProfile={profile}
            >
            <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
    );
}
