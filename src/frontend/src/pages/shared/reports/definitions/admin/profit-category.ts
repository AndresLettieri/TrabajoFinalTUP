import { getCategoriesProfit } from "../../../../../services/reports/reportService";
import type { SalesTopCategoriesResponse } from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

const profitCategoryReport: ReportDefinition<SalesTopCategoriesResponse> = {
    id: "profit-category",
    title: "Ganancias por Categoría",
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
            label: "Ventas totales",
            format: "currency",
        },
        {
            key: "totalProfit",
            label: "Ganancia",
            format: "currency",
        }
    ],
    summaryLabels: {
        total: "Ganancia total",
        count: "Cantidad de ventas",
    },

    async execute(filters) {
        const report = await getCategoriesProfit({
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
export default profitCategoryReport;