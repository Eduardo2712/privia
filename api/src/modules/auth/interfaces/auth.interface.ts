interface AuthUserInterface {
    email: string;
    name: string;
}

export interface AuthInterface {
    token: string;
    user: AuthUserInterface;
}

