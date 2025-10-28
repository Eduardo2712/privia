export interface AuthUserInterface {
    email: string;
    name: string;
}

export interface AuthStoreInterface {
    user: AuthUserInterface | null;
    token: string | null;
}

export interface LoginResponse {
    user: AuthUserInterface;
}
