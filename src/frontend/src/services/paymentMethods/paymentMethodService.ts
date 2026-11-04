import { get } from "../api/http";

export interface PaymentMethod {
    id: number;
    name: string;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    return get<PaymentMethod[]>("/payment-methods");
}
