import { get, getByFilter, post, put, del } from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface Customer {
    id: number;
    name: string;
    document: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    observations: string | null;
    active: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
}

export interface CustomerFilter  {
    name?: string;
    phone?: string;
    email?: string;
    document?: string;
    active?: boolean;
    page?: number;
    pageSize?: number;
}

export interface CreateCustomerRequest {
    name: string;
    document: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    observations: string | null;
}

export async function getCustomers(): Promise<Customer[]> {
    return get<Customer[]>("/customers");
}

export async function getCustomerByFilter(filter?: CustomerFilter): Promise<PagedResult<Customer>> {
    return getByFilter<PagedResult<Customer>>("/customers/getByFilter", (filter || {}) as Record<string, unknown>);
}

export async function createCustomer(customer: CreateCustomerRequest): Promise<Customer> {
 
    return post<Customer>( 
        "/customers", 
        { 
            ...customer
        } 
    );
}

export async function updateCustomer(id: number,customer: CreateCustomerRequest): Promise<Customer> {

      return put<Customer>( 
        `/customers/${id}`, 
        { 
            ...customer
        } 
    );
}

export async function delCustomer(id: number): Promise<Customer> {
    return del<Customer>(
        `/customers/${id}`
    );
}

import { patch } from "../api/http";

export async function activateCustomer(id: number): Promise<Customer> {

    return patch<Customer>(
        `/customers/${id}/activate`
    );
}