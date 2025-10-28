import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { update } from "../store/auth/auth.slice";
import { checkIsPublicRoute, checkUserAuthenticated } from "../utils/route";

export type Props = {
    children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const path = usePathname();

    const isPublicPage = checkIsPublicRoute(path);

    const isClient = typeof window !== "undefined";

    useEffect(() => {
        if (!isClient) {
            return;
        }

        const isUserAuthenticated = checkUserAuthenticated();

        const userRaw = localStorage.getItem("user");
        const tokenRaw = localStorage.getItem("token");

        const safeParse = <T,>(value: string | null): T | null => {
            if (!value) {
                return null;
            }

            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        };

        if (isUserAuthenticated) {
            const user = safeParse<{ name: string; email: string }>(userRaw);
            const token = safeParse<string>(tokenRaw);

            dispatch(update({ user, token }));
        }

        if (!isUserAuthenticated && !isPublicPage) {
            router.replace("/auth/login");
        }
    }, [router, dispatch, isClient, path, isPublicPage]);

    return <>{children}</>;
};

export default ProtectedRoute;
