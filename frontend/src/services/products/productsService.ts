
import { get, getByFilter, post, put, patch, del} from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface Product {
    id: number;
    code: string;
    barcode: string | null;
    description: string;
    categoryId: number;
    categoryName: string;
    brandId: number;
    brandName: string;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minimumStock: number;
    active: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
}



export interface ProductFilter {
    code?: string;
    barcode?: string;
    description?: string;
    categoryId?: number;
    brandId?: number;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export interface CreateProductRequest {
    code: string;
    barcode: string | null;
    description: string;
    categoryId: number;
    brandId: number;
    purchasePrice: number;
    salePrice: number;
    stock: number;
    minimumStock: number;
}


export async function getProducts(): Promise<Product[]> {
    return get<Product[]>("/products");
}

export async function getProductsByFilter(filter: ProductFilter = {}): Promise<PagedResult<Product>> {
    return getByFilter<PagedResult<Product>>("/products/getByFilter",filter as Record<string, unknown>);
}

export async function createProduct(product: CreateProductRequest): Promise<Product> {
    return post<Product>(
        "/products", 
        {
            ...product
        }
    );
}

export async function updateProduct(id: number,product: CreateProductRequest): Promise<Product> {
    return put<Product>(
        `/products/${id}`, 
        { 
            ...product 
        }
    );
}

export async function delProduct(id: number): Promise<Product> {
    return del<Product>(
        `/products/${id}`
    );
}

export async function activateProduct(id: number): Promise<Product> {
    return patch<Product>(
        `/products/${id}/activate`
    );
}


