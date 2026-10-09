import { get, post, put, del, getByFilter } from "../api/http";
import type { PagedResult } from "../customers/customerService";

export interface Brand {
    id: number;
    name: string;
    active: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
    
}

export interface CreateBrandRequest {
    name: string;
}

export interface BrandFilter  {
    name?: string;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export async function getBrands(): Promise<Brand[]> {
    return get<Brand[]>("/brands");
}

export async function getBrandByFilter(filter?: BrandFilter): Promise<PagedResult<Brand>> {
    return getByFilter<PagedResult<Brand>>("/brands/getByFilter", (filter || {}) as Record<string, unknown>);
}


export async function createBrand(brand: CreateBrandRequest): Promise<Brand> {


    return post<Brand>(
        "/brands",
        {
            ...brand
        }
    );
}

export async function updateBrand(id: number, brand: CreateBrandRequest): Promise<Brand> {

    return put<Brand>(
        `/brands/${id}`,
        {
            ...brand
        }
    );
}

export async function delBrand(id: number): Promise<Brand> {

    return del<Brand>(
        `/brands/${id}`
    );
}