import { get, post, put, del, getByFilter, patch } from "../api/http";
import type { PagedResult } from "../../types/pagination";

export type Role = "Admin" | "Seller";

export interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    role: Role;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: Role;
}

export interface UserFilter  {
    name?: string;
    email?: string;
    role?: Role;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export async function getUser(): Promise<User[]> {
    return get<User[]>("/users");
}

export async function getUserByFilter(filter?: UserFilter): Promise<PagedResult<User>> {
    return getByFilter<PagedResult<User>>("/users/getByFilter", (filter || {}) as Record<string, unknown>);
}


export async function createUser(user: CreateUserRequest): Promise<User> {


    return post<User>(
        "/users",
        {
            ...user
        }
    );
}

export async function updateUser(id: number, user: CreateUserRequest): Promise<User> {

    return put<User>(
        `/users/${id}`,
        {
            ...user
        }
    );
}

export async function delUser(id: number): Promise<User> {

    return del<User>(
        `/users/${id}`
    );
}

export async function activateUser(id: number): Promise<User> {

    return patch<User>(
        `/users/${id}/activate`
    );
}