"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase-shared/client";

import type { MasterLoginUserType } from "@/schemas/common/masterLoginUserSchema";
import type { MasterStaffType } from "@/schemas/common/masterStaffSchema";
import type { MasterDepartmentType } from "@/schemas/common/masterDepartmentSchema";

interface StaffType extends MasterStaffType {
    department: MasterDepartmentType;
}

interface LoginUserType extends MasterLoginUserType {
    staffs: StaffType[];
}

type AuthContextValue = {
    user: LoginUserType | null;
    profile: StaffType | null;
    setProfile: (profile: StaffType | null) => void;
    isLoading: boolean;
    reloadUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
    user: null,
    profile: null,
    setProfile: () => { },
    isLoading: true,
    reloadUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
    children,
    initialUser,
    initialProfile,
}: {
    children: ReactNode;
    initialUser: LoginUserType | null;
    initialProfile: StaffType | null;
}) {
    const supabase = useMemo(() => createClient(), []);
    const common = useMemo(() => supabase.schema("common"), [supabase]);

    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const [user, setUser] = useState<LoginUserType | null>(initialUser);
    const [profile, setProfile] = useState<StaffType | null>(initialProfile);
    const [isLoading, setIsLoading] = useState(true);

    const didNavigateRef = useRef(false);

    const buildReturnTo = () => {
        const qs = sp.toString();
        return `${pathname}${qs ? `?${qs}` : ""}`;
    };

    const goStaffSelectOnce = () => {
        // すでに選択画面にいるなら遷移しない
        if (pathname.startsWith("/select/staff")) return;

        // 多重遷移防止（StrictMode/devでも安全）
        if (didNavigateRef.current) return;
        didNavigateRef.current = true;

        const returnTo = buildReturnTo();
        router.replace(`/select/staff?returnTo=${encodeURIComponent(returnTo)}`);
    };

    const reloadUser = async () => {
        setIsLoading(true);

        const { data: authData, error: authErr } = await supabase.auth.getUser();
        const email = authData.user?.email;

        // ⚠️ callback直後など一瞬 null になることがあるので、ここで即 /login に飛ばさない
        if (authErr || !email) {
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            return;
        }

        const { data, error } = await common
            .from("master_login_users")
            .select(
                `
                *,
                staffs:master_staffs(
                    *,
                    memberships:staff_departments(
                        *,
                        department:master_departments(*)
                    )
                )
            `
            )
            .eq("email", email)
            .maybeSingle();

        if (error || !data) {
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            return;
        }

        setUser(data as LoginUserType);
        setIsLoading(false);
    };

    // ① 初回ロード + authイベントで再ロード
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled) return;
            await reloadUser();
        };

        run();

        const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
            // SIGNED_IN / INITIAL_SESSION / TOKEN_REFRESHED などで再ロード
            // （refresh連打はしない。stateで更新する）
            if (cancelled) return;
            run();
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ② user確定後：staffsに応じて profile 決定 or staff選択へ
    useEffect(() => {
        if (!user) return;

        // ログイン成功したら /login 側の「1回だけ自動ログイン」フラグを解除
        try {
            sessionStorage.removeItem("oauth_started");
        } catch { }

        const staffList = user.staffs ?? [];

        // 選択済み staff を復元
        const staffId = (() => {
            try {
                return sessionStorage.getItem("selectedStaffId");
            } catch {
                return null;
            }
        })();

        if (staffId) {
            const found = staffList.find((s) => s.id === staffId);

            if (found) {
                if(found.memberships) {
                    const nomarized = {
                        ...found,
                        department: found?.memberships[0]?.department ?? found.department,
                    } as StaffType;

                    setProfile(nomarized);
                    return;
                }

                // 同じ profile を無駄に set しない（無限レンダ抑止）
                setProfile((prev) => (prev?.id === found.id ? prev : found));
                return;
            }

            // もう存在しないなら消す
            try {
                sessionStorage.removeItem("selectedStaffId");
            } catch { }
        }

        // staffが1件なら自動確定
        if (staffList.length === 1) {
            const only = staffList[0];
            try {
                sessionStorage.setItem("selectedStaffId", only.id);
            } catch { }
            return;
        }

        // staffが複数なら選択画面へ（多重遷移ガード付き）
        if (staffList.length >= 2) {
            goStaffSelectOnce();
            return;
        }

        // staffsが0件は異常
        setProfile(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, pathname]); // pathname変化でreturnTo更新される可能性があるため含める

    // ③ ロード終了後に user が無ければ login へ
    useEffect(() => {
        if (isLoading) return;
        if (user) return;

        // /login / /auth/callback などでは無限ループを避ける
        if (pathname.startsWith("/login")) return;
        if (pathname.startsWith("/auth/callback")) return;

        router.replace("/login");
    }, [isLoading, user, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, profile, setProfile, isLoading, reloadUser }}>
            {children}
        </AuthContext.Provider>
    );
}
