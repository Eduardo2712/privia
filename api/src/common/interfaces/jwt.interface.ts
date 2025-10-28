export interface JWTUserInterface {
    sub: number;
}

export interface LoggedUserInterface {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

