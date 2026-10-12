import { getTopProductsReport } from "../../../../../services/reports/reportService";
import type { SalesTopProductsResponse } from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

const bestSellingProductsReport: ReportDefinition<SalesTopProductsResponse> = {
    id: "best-selling-products",
    title: "Productos más vendidos",
    filters: [],
    columns: [
        {
            key: "productCode",
            label: "Código",
            format: "text",
        },
        {
            key: "productDescription",
            label: "Descripción",
            format: "text",
        },
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
        },
    ],

    summaryLabels: {
        total: "Total vendido",
        count: "Total ganancia",
    },

    async execute(filters) {
        const report = await getTopProductsReport({
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
export default bestSellingProductsReport;