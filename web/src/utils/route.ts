export const ROUTES = {
    public: {
        index: "/",
        login: "/auth/login",
        register: "/auth/register",
    },
};

export const checkUserAuthenticated = () => {
    if (typeof window === "undefined") return false;
    const rawToken = localStorage.getItem("token");

    if (!rawToken) return false;

    try {
        const parsed = JSON.parse(rawToken);
        return !!parsed;
    } catch {
        // In case token was saved without JSON.stringify for any reason
        return !!rawToken;
    }
};

export const checkIsPublicRoute = (route: string) => {
    const publicRoutes = Object.values(ROUTES.public);

    return publicRoutes.includes(route);
};
