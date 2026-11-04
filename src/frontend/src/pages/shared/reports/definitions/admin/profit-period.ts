import { getProfitByPeriod } from "../../../../../services/reports/reportService";
import type { ProfitReportSale } from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

const profitPeriodReport: ReportDefinition<ProfitReportSale> = {
    id: "profit-period",
    title: "Ganancias por período",
    filters: [],
    columns: [
        {
            key: "number",
            label: "Comprobante",
            format: "text",
        },
        {
            key: "date",
            label: "Fecha",
            format: "date",
        },
        {
            key: "customerName",
            label: "Cliente",
            format: "text",
        },
        {
            key: "sellerName",
            label: "Vendedor",
            format: "text",
        },
        {
            key: "profit",
            label: "Ganancia",
            format: "currency",
        },
    ],

    summaryLabels: {
        total: "Ganancia total",
        count: "Cantidad de ventas",
    },

    async execute(filters) {
        const report = await getProfitByPeriod({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });

        return {
            rows: report.sales,
            summary: {
                total: report.totalProfit,
                count: report.salesCount,
            },
        };
    },
};
export default profitPeriodReport;