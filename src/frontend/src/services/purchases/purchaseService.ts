import { get, post, getByFilter, put} from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface PurchaseFilter {
    dateFrom?: string;
    dateTo?: string;
    vendorId?: number;
    number?: number;
    page?: number;
    pageSize?: number;
}

export interface CreatePurchaseDetailRequest {
    productId: number;
    quantity: number;
    purchasePrice: number;
}

export interface CreatePurchaseRequest {
  vendorId: number;
  number: number;
  date: string;
  observations?: string;
  details: CreatePurchaseDetailRequest[];
}

export interface PurchaseDetail {
  productId: number;
  productCode: string;
  productDescription: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  vendorId: number;
  vendorName: string;
  number: number;
  date: string;
  total: number;
  observations?: string | null;
  cancelled: boolean;
  createdAt: string;
  createdBy: number;
  modifiedAt?: string | null;
  modifiedBy?: number | null;
  details: PurchaseDetail[];
}


export async function getPurchases(): Promise<Purchase[]> {
    return get<Purchase[]>("/purchases");
}

export async function getPurchasesByFilter(filter: PurchaseFilter = {}): Promise<PagedResult<Purchase>> {
    return getByFilter<PagedResult<Purchase>>("/purchases/getByFilter",filter as Record<string, unknown>);
}

export async function createPurchase(request: CreatePurchaseRequest): Promise<Purchase> {
    return post<Purchase>("/purchases", request);
}

export async function updatePurchase(id: number,request: CreatePurchaseRequest): Promise<Purchase> {
    return put<Purchase>(
        `/purchases/${id}`, 
        { 
            ...request 
        }
    );
}

export async function cancelPurchase(id: number): Promise<Purchase> {
    return post<Purchase>(
        `/purchases/${id}/cancel`, {}
    );
}

export async function getPurchaseById(id: number): Promise<Purchase> {
    return get<Purchase>(`/purchases/${id}`);
}

