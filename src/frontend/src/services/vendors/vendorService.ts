import { get, post, put, del, getByFilter, patch } from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface Vendor {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    observations: string;
    active: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
    
}

export interface CreateVendorRequest {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    observations: string | null;
}

export interface VendorFilter  {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export async function getVendors(): Promise<Vendor[]> {
    return get<Vendor[]>("/vendors");
}

export async function getVendorByFilter(filter?: VendorFilter): Promise<PagedResult<Vendor>> {
    return getByFilter<PagedResult<Vendor>>("/vendors/getByFilter", (filter || {}) as Record<string, unknown>);
}


export async function createVendor(vendor: CreateVendorRequest): Promise<Vendor> {


    return post<Vendor>(
        "/vendors",
        {
            ...vendor
        }
    );
}

export async function updateVendor(id: number, vendor: CreateVendorRequest): Promise<Vendor> {

    return put<Vendor>(
        `/vendors/${id}`,
        {
            ...vendor
        }
    );
}

export async function delVendor(id: number): Promise<Vendor> {

    return del<Vendor>(
        `/vendors/${id}`
    );
}

export async function activateVendor(id: number): Promise<Vendor> {

    return patch<Vendor>(
        `/vendors/${id}/activate`
    );
}