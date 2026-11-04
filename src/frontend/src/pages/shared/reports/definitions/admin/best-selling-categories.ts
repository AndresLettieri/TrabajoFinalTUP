import { getTopCategoriesReport } from "../../../../../services/reports/reportService";
import type { SalesTopCategoriesResponse } from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

const bestSellingCategoriesReport: ReportDefinition<SalesTopCategoriesResponse> = {
    id: "best-selling-categories",
    title: "Categorías más vendidas",
    filters: [],
    columns: [
        {
            key: "categoryName",
            label: "Categoría",
            format: "text",
        },
        {
            key: "totalQuantitySold",
            label: "Cantidad vendida",
            format: "number",
        },
        {
            key: "totalSales",
            label: "Total ventas",
            format: "currency",
        },
        {
            key: "totalProfit",
            label: "Ganancia total",
            format: "currency",
        }
    ],

    summaryLabels: {
        total: "Total vendido",
        count: "Total ganancia",
    },

    async execute(filters) {
        const report = await getTopCategoriesReport({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });
        

        return {
            rows: report.map(row => row),
            summary: {
                total: report.map((category) => category.totalProfit).reduce((acc, curr) => acc + curr, 0),
                count: report.map((category) => category.totalQuantitySold).reduce((acc, curr) => acc + curr, 0),
            },
        };
    },
};
export default bestSellingCategoriesReport;