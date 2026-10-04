import { get } from "../api/http";

export interface Purchase {
    id: number;
    vendorId: number;
    vendorName: string;
    number: number;
    date: string;
    total: number;
    observations: string | null;
    cancelled: boolean;
    createdAt: string;
    createdBy: number;
    modifiedAt: string | null;
    modifiedBy: number | null;
}

export async function getPurchases(): Promise<Purchase[]> {
    return get<Purchase[]>("/purchases");
}