import { get, post, put, del } from "../api/http";
import { getCurrentUser } from "../auth/authSession";

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

export interface CustomerFilter {
    name?: string;
    phone?: string;
    email?: string;
    document?: string;
    active?: boolean;
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


export async function getCustomers(filter?: CustomerFilter): Promise<Customer[]> {
    const customers = await get<Customer[]>("/customers");
    if (!filter) 
        return customers;

    return customers.filter(customer => {
        if (filter.name && !customer.name.toLowerCase().includes(filter.name.toLowerCase()))
            return false;

        if (filter.phone && !customer.phone?.includes(filter.phone)) 
            return false;
        

        if (filter.email && !customer.email?.toLowerCase().includes(filter.email.toLowerCase())) 
            return false;
        
        if (filter.document && !customer.document.includes(filter.document)) 
            return false;
        

        if (filter.active !== undefined && customer.active !== filter.active) 
            return false;
        
        return true;
    });
}

export async function createCustomer(customer: CreateCustomerRequest): Promise<Customer> {

    const currentUser = getCurrentUser();

    if (!currentUser) 
        throw new Error("No hay un usuario autenticado.");


    return post<Customer>( 
        "/customers", 
        { 
            ...customer
        } 
    );
}

export async function updateCustomer(id: number,customer: CreateCustomerRequest): Promise<Customer> {

    const currentUser = getCurrentUser();

    if (!currentUser) 
        throw new Error("No hay un usuario autenticado.");

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