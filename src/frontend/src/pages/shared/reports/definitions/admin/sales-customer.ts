import { getSalesByCustomer, type OrderReport} from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

type SalesCustomerRow = OrderReport;

const salesCustomerReport: ReportDefinition<SalesCustomerRow> = {
    id: "sales-customer",
    title: "Ventas por cliente",
    filters: ["customer"],
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
        if (!filters.customerId || !Number.isInteger(filters.customerId)) {
            const pError = document.getElementById("report-filter-error");
            if (pError) {
                pError.hidden = false;
                pError.textContent = "Seleccioná un cliente de la lista.";
            }
            throw new Error("Seleccioná un cliente de la lista.");
        }

        const report = await getSalesByCustomer(
            filters.customerId,
            {
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
            },
        );

        const activeSales = report.sales.filter((sale) => !sale.cancelled);

        const itemsSold = activeSales.reduce(
            (total, sale) => total + sale.details.reduce((sum, detail) => sum + detail.quantity,0,),0,
        );

        return {
            rows: activeSales,
            summary: {
                total: activeSales.reduce((total, sale) => total + sale.total,0),
                count: activeSales.length,
                items: itemsSold,
            },
        };
    },
};

export default salesCustomerReport;