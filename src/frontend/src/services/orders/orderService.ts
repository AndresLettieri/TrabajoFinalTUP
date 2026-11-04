import { get, post, put, getByFilter } from "../api/http";
import type { PagedResult } from "../../types/pagination";

export interface OrderFilter {
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
    sellerId?: number;
    number?: number;
    page?: number;
    pageSize?: number;
}



export interface Order {
    id: number;
    number: number;
    customerId: number;
    customerName: string;
    sellerId: number;
    sellerName: string;
    paymentMethodId: number;
    paymentMethodName: string;
    date: string;
    total: number;
    cancelled: boolean;
    active: boolean;
    details: OrderDetail[];
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
}

export interface OrderDetail {
    productId: number;
    productCode: string;
    productDescription: string;
    quantity: number;
    salePrice: number;
    purchasePrice: number;
    subtotal: number;
}


export interface CreateOrderRequest {
    customerId: number;
    sellerId: number;
    paymentMethodId: number;
    date: string;
    details: OrderDetailRequest[];
}

export interface OrderDetailRequest {
    productId: number;
    quantity: number;
}

export async function getOrders(): Promise<Order[]> {
    return get<Order[]>("/orders");
}

export async function getOrdersByFilter(filter: OrderFilter = {}): Promise<PagedResult<Order>> {
    return getByFilter<PagedResult<Order>>("/orders/getByFilter",filter as Record<string, unknown>);
}

export async function createOrder(order: CreateOrderRequest): Promise<Order> {

    return post<Order>(
        "/orders",
        {
            ...order
        }
    );
}

export async function updateOrder(id: number, order: CreateOrderRequest): Promise<Order> {

    return put<Order>(
        `/orders/${id}`,
        {
            ...order
        }
    );
}

export async function cancelOrder(id: number): Promise<Order> {
    return post<Order>(
        `/orders/${id}/cancel`, {}
    );
}

export async function getOrderById(id: number): Promise<Order> {
    return get<Order>(`/orders/${id}`);
}
