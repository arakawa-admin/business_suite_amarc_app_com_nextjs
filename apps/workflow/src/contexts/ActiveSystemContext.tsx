
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type ActiveSystemCtx = {
    activeSystem: string | null;
    setActiveSystem: (activeSystem: string) => void;
};
const ActiveSystemContext = createContext<ActiveSystemCtx>({
    activeSystem: null,
    setActiveSystem: () => { },
});
export const useActiveSystem = () => useContext(ActiveSystemContext);

export function ActiveSystemProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    const [activeSystem, setActiveSystem] = useState<string | null>(sessionStorage.getItem("activeSystem") || null);

    // ** checkActiveSystem ** //
    useEffect(() => {
        if (!activeSystem) {
            router.push("/select/active-system");
            return;
        }
    }, [activeSystem, router]);
    // ** checkActiveSystem ** //

    return (
        <ActiveSystemContext.Provider
            value={{ activeSystem, setActiveSystem }}
        >
            {children}
        </ActiveSystemContext.Provider>
    );
}
