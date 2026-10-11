import { get } from "../api/http";

export interface SalesReportFilter {
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReportResponse {
  dateFrom: string;
  dateTo: string;
  salesCount: number;
  totalAmount: number;
  sales: OrderReport[];
}

export interface OrderReport {
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
  createdAt: string;
  createdBy: number;
  modifiedAt: string | null;
  modifiedBy: number | null;
  details: OrderDetailReport[];
}

export interface OrderDetailReport {
  productId: number;
  productCode: string;
  productDescription: string;
  quantity: number;
  salePrice: number;
  purchasePrice: number;
  subtotal: number;
}

export interface PurchasesReportFilter {
  dateFrom?: string;
  dateTo?: string;
  vendorId?: number;
}

export interface PurchasesReportResponse {
  dateFrom: string;
  dateTo: string;
  purchaseCount: number;
  totalAmount: number;
  purchases: PurchaseReport[];
}

export interface PurchaseReport {
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
  details: PurchaseDetailReport[];
}

export interface PurchaseDetailReport {
  productId: number;
  productCode: string;
  productDescription: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface ProfitReportDetail {
    productId: number;
    productCode: string;
    productDescription: string;
    quantity: number;
    salePrice: number;
    purchasePrice: number;
    subtotal: number;
    profit: number;
}

export interface ProfitReportSale {
    id: number;
    number: number;
    date: string;
    customerName: string;
    sellerName: string;
    total: number;
    profit: number;
    details: ProfitReportDetail[];
}

export interface ProfitReport {
    dateFrom: string;
    dateTo: string;
    salesCount: number;
    totalProfit: number;
    sales: ProfitReportSale[];
}

export interface SalesReportFilter {
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
}

export async function getPurchasesReport(filters: PurchasesReportFilter = {},): Promise<PurchasesReportResponse> {
    const params = new URLSearchParams();

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
    }

    if (filters.vendorId !== undefined) {
        params.append("vendorId", String(filters.vendorId));
    }

    const queryString = params.toString();
    const endpoint = queryString
        ? `/reports/purchases?${queryString}`
        : "/reports/purchases";

    return get<PurchasesReportResponse>(endpoint);
}

export async function getSalesReport(filters: SalesReportFilter = {},): Promise<SalesReportResponse> {
    const params = new URLSearchParams();

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
    }

    const queryString = params.toString();
    const endpoint = queryString
        ? `/reports/sales?${queryString}`
        : "/reports/sales";

    return get<SalesReportResponse>(endpoint);
}

export async function getProfitByPeriod(
    filters: SalesReportFilter = {},
): Promise<ProfitReport> {
    const params = new URLSearchParams();

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
    }

    const queryString = params.toString();
    const endpoint = queryString
        ? `/reports/profit?${queryString}`
        : "/reports/profit";

    return get<ProfitReport>(endpoint);
}

export async function getSalesByCustomer(
    customerId: number,
    filters: SalesReportFilter = {},
): Promise<SalesReportResponse> {
    const params = new URLSearchParams();

    params.append("customerId", customerId.toString());

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
    }

    return get<SalesReportResponse>(
        `/reports/sales/by-customer?${params.toString()}`
    );
}

export async function getSalesBySeller(
    sellerId: number,
    filters: SalesReportFilter = {},
): Promise<SalesReportResponse> {
    const params = new URLSearchParams();

    params.append("sellerId", sellerId.toString());

    if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
    }

    if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
    }

    return get<SalesReportResponse>(
        `/reports/sales/by-seller?${params.toString()}`
    );
}