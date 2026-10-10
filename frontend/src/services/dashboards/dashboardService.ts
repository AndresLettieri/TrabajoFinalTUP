import type { Product } from "../products/productsService";
import { get } from "../api/http";

export interface Dashboard {
  today: string;
  salesTodayCount: number;
  salesTodayAmount: number;
  purchasesTodayCount: number;
  purchasesTodayAmount: number;
  periodDateFrom: string;
  periodDateTo: string;
  salesInPeriodCount: number;
  periodRevenue: number;
  estimatedProfit: number;
  lowStockProductsCount: number;
  lowStockProducts: Product[];
}

export interface DashboardFilters {
  userId: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function getAdminDashboard(filters: DashboardFilters): Promise<Dashboard> {
  const params = new URLSearchParams();
  params.set("userId", String(filters.userId));
  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }
  return get<Dashboard>(
    `/dashboard/admin?${params.toString()}`);
}

