import { getSalesReport } from "../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../utils/reportsCore/report.types";

interface SalesPeriodRow {
  number: number;
  date: string;
  customerName: string;
  sellerName: string;
  total: number;
}

const salesPeriodReport: ReportDefinition<SalesPeriodRow> = {
    id: "sales-period",
    title: "Ventas por período",
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
            key: "total",
            label: "Total",
            format: "currency"
        },
    ],

    summaryLabels: {
        total: "Total vendido",
        count: "Cantidad de comprobantes",
        items: "Artículos vendidos",
    },

    async execute(filters) {
        const report = await getSalesReport({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });

        const activeSales = report.sales.filter((sale) => !sale.cancelled);
        const itemsSold = activeSales.reduce(
        (total, sale) => total + sale.details.reduce((detailTotal, detail) => detailTotal + detail.quantity,0,),0);

        return {
            rows: activeSales.map((sale) => ({
                number: sale.number,
                date: sale.date,
                customerName: sale.customerName,
                sellerName: sale.sellerName,
                total: sale.total,
            })),
            summary: {
                total: report.totalAmount,
                count: report.salesCount,
                items: itemsSold,
            },
        };
    },
};

export default salesPeriodReport;