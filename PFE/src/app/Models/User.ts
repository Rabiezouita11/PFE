export interface User {
    id: number;
    username: string;
    email: string;
    roles: Role[];
    status: boolean;
}

export interface Role {
    id: number;
    name: string;
}
