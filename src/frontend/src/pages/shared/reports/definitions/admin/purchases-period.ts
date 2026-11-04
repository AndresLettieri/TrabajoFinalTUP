import {getPurchasesReport, type PurchaseReport} from "../../../../../services/reports/reportService";
import type { ReportDefinition } from "../../../../../utils/reportsCore/report.types";

const purchasesPeriodReport: ReportDefinition<PurchaseReport> = {
    id: "purchases-period",
    title: "Compras por período",
    filters: ["vendor"],
    filterDefinitions: [
        {
            type: "vendor",
            label: "Proveedor",
            placeholder: "Todos los proveedores",
        },
    ],
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
            key: "vendorName",
            label: "Proveedor",
            format: "text",
        },
        {
            key: "total",
            label: "Total",
            format: "currency",
        },
    ],

    summaryLabels: {
        total: "Total comprado",
        count: "Cantidad de compras",
    },

    async execute(filters) {
        const report = await getPurchasesReport({
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            vendorId: filters.vendorId,
        });

        const purchases = report.purchases.filter((purchase) => !purchase.cancelled);

        return {
            rows: purchases,
            summary: {
                total: report.totalAmount,
                count: report.purchaseCount,
            },
        };
    },
};

export default purchasesPeriodReport;