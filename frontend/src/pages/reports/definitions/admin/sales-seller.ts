import { getSalesBySeller } from "../../../../services/reports/reportService";
import type { OrderReport } from "../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../utils/reportsCore/report.types";

const salesSellerReport: ReportDefinition<OrderReport> = {
    id: "sales-seller",
    title: "Ventas por vendedor",
    filters: ["seller"],
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
    },

    async execute(filters) {
        const sellerId = filters.sellerId;

        if (
            sellerId === undefined ||
            !Number.isInteger(sellerId) ||
            sellerId <= 0
        ) {
            const pError = document.getElementById("report-filter-error");
            if (pError) {
                pError.hidden = false;
                pError.textContent = "Seleccioná un vendedor de la lista.";
            }
            throw new Error("Seleccioná un vendedor de la lista.");
        }

        const report = await getSalesBySeller(sellerId, {
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
        });

        return {
            rows: report.sales.filter(
                (sale) => !sale.cancelled,
            ),

            summary: {
                total: report.totalAmount,
                count: report.salesCount,
            },
        };
    },
};

export default salesSellerReport;