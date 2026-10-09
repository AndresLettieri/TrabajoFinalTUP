import { get, post, put, del, getByFilter, patch } from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface Category {
    id: number;
    name: string;
    active: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
    
}

export interface CreateCategoryRequest {
    name: string;
}

export interface CategoryFilter  {
    name?: string;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export async function getCategories(): Promise<Category[]> {
    return get<Category[]>("/categories");
}

export async function getCategoryByFilter(filter?: CategoryFilter): Promise<PagedResult<Category>> {
    return getByFilter<PagedResult<Category>>("/categories/getByFilter", (filter || {}) as Record<string, unknown>);
}


export async function createCategory(category: CreateCategoryRequest): Promise<Category> {


    return post<Category>(
        "/categories",
        {
            ...category
        }
    );
}

export async function updateCategory(id: number, category: CreateCategoryRequest): Promise<Category> {

    return put<Category>(
        `/categories/${id}`,
        {
            ...category
        }
    );
}

export async function delCategory(id: number): Promise<Category> {

    return del<Category>(
        `/categories/${id}`
    );
}

export async function activateCategory(id: number): Promise<Category> {

    return patch<Category>(
        `/categories/${id}/activate`
    );
}