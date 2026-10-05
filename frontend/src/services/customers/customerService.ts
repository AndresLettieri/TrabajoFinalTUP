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

    //TODO: Mock para usar json.DB. Se debe reemplazar con la lógica real cuando se tenga un backend.
    const newCustomer: Customer = {
        id: 0,
        name: customer.name,
        document: customer.document,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        observations: customer.observations,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        modifiedAt: null,
        modifiedBy: null
    };
    return post<Customer>("/customers", newCustomer);
}

export async function updateCustomer(id: number,customer: CreateCustomerRequest): Promise<Customer> {

    const currentUser = getCurrentUser();

    if (!currentUser) 
        throw new Error("No hay un usuario autenticado.");

    //TODO: Mock para usar json.DB. Se debe reemplazar con la lógica real cuando se tenga un backend.
    const updatedCustomer: Customer = {
        id,
        ...customer,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        modifiedAt: new Date().toISOString(),
        modifiedBy: currentUser.id
    };
    return put<Customer>(
        `/customers/${id}`,
        updatedCustomer
    );
}

export async function delCustomer(id: number): Promise<Customer> {
    return del<Customer>(
        `/customers/${id}`
    );
}