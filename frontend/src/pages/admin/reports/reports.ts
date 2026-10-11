import reportsHtml from "./reports.html?raw";

import { getSalesReport, getPurchasesReport, getProfitByPeriod, getSalesByCustomer,
    type OrderReport, type PurchaseReport, type ProfitReportSale, 
    getSalesBySeller} from "../../../services/reports/reportService";
import { renderLayout } from "../../shared/layout";
import { formatCurrency } from "../../../utils/formatsUtils";
import { getVendors } from "../../../services/vendors/vendorService";
import { getUser, type User } from "../../../services/users/userService";
import { populateSelect } from "../../../utils/selectOptions";
import { getCustomers, type Customer } from "../../../services/customers/customerService";
import { initCustomerSearch } from "../../../components/customerSearch/customerSearch";

interface ReportConfig {
    title: string;
    totalLabel: string;
    countLabel: string;
    itemsLabel?: string;
    showItemsCard: boolean;
    showVendorFilter: boolean;
    showCustomerFilter: boolean;
    showSellerFilter: boolean;
    headers: string[];
}

const reportConfig: Partial<Record<ReportType, ReportConfig>> = {
    "sales-period": {
        title: "Ventas por período",
        totalLabel: "Total vendido",
        countLabel: "Cantidad de comprobantes",
        itemsLabel: "Artículos vendidos",
        showItemsCard: true,
        showVendorFilter: false,
        showCustomerFilter: false,
        showSellerFilter: false,
        headers: ["Comprobante", "Fecha", "Cliente", "Vendedor", "Total"],
    },
    "purchases-period": {
        title: "Compras por período",
        totalLabel: "Total comprado",
        countLabel: "Cantidad de compras",
        showItemsCard: false,
        showVendorFilter: true,
        showCustomerFilter: false,
        showSellerFilter: false,
        headers: ["Comprobante", "Fecha", "Proveedor", "Total"],
    },
    "profit-period": {
        title: "Ganancias por período",
        totalLabel: "Ganancia total",
        countLabel: "Cantidad de ventas",
        showItemsCard: false,
        showVendorFilter: false,
        showCustomerFilter: false,
        showSellerFilter: false,
        headers: ["Comprobante","Fecha","Cliente","Vendedor","Ganancia"],
    },
    "sales-customer": {
        title: "Ventas por cliente",
        totalLabel: "Total vendido",
        countLabel: "Cantidad de comprobantes",
        showItemsCard: false,
        showVendorFilter: false,
        showCustomerFilter: true,
        showSellerFilter: false,
        headers: ["Comprobante","Fecha","Cliente","Vendedor","Total"],
    },
    "sales-seller": {
        title: "Ventas por vendedor",
        totalLabel: "Total vendido",
        countLabel: "Cantidad de comprobantes",
        showItemsCard: false,
        showVendorFilter: false,
        showCustomerFilter: false,
        showSellerFilter: true,
        headers: ["Comprobante", "Fecha", "Cliente", "Vendedor", "Total"],
    }
};

type ReportType =
    | "sales-period"
    | "purchases-period"
    | "profit-period"
    | "sales-customer"
    | "sales-seller"
    | "best-selling-products"
    | "best-selling-categories"
    | "profit-category";


export function renderReports(): void {
    renderLayout(reportsHtml);
    
    const reportTypeSelect = document.querySelector<HTMLSelectElement>("#report-type");
    const reportContent = document.querySelector<HTMLDivElement>("#report-content");

    if (!reportTypeSelect || !reportContent) {
        throw new Error("No se pudo inicializar el selector de reportes.");
    }

    reportTypeSelect.addEventListener("change", () => {
        clearReportResults();
        configureReport();

        if (reportTypeSelect.value === "purchases-period") {
            void loadVendors();
        }
        if (reportTypeSelect.value === "sales-customer") {
            void loadCustomers();
        }
        if (reportTypeSelect.value === "sales-seller") {
            void loadSellers();
        }
    });
    
    const dateFromInput = document.querySelector<HTMLInputElement>("#report-date-from");
    const dateToInput = document.querySelector<HTMLInputElement>("#report-date-to");

    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    dateFromInput!.max = todayString;
    dateToInput!.max = todayString;

    dateFromInput!.value = todayString;
    dateToInput!.value = todayString;


    const generateButton = document.querySelector<HTMLButtonElement>("#generate-report-button");
    const totalSoldElement = document.querySelector<HTMLElement>("#report-total-sold");
    const salesCountElement = document.querySelector<HTMLElement>("#report-sales-count");
    const itemsSoldElement = document.querySelector<HTMLElement>("#report-items-sold");
    const errorElement = document.querySelector<HTMLParagraphElement>("#report-error");
    const emptyMessage = document.querySelector<HTMLParagraphElement>("#report-empty-message");
    const salesTableBody = document.querySelector<HTMLTableSectionElement>("#report-sales-table-body");
    const paginationInfo = document.querySelector<HTMLElement>("#report-pagination-info");
    const currentPageElement = document.querySelector<HTMLElement>("#report-current-page");
    const previousPageButton = document.querySelector<HTMLButtonElement>("#report-previous-page");
    const nextPageButton = document.querySelector<HTMLButtonElement>("#report-next-page");
    const reportResults = document.querySelector<HTMLElement>("#report-results");
    const totalLabel = document.querySelector<HTMLElement>("#report-total-label");
    const countLabel = document.querySelector<HTMLElement>("#report-count-label");
    const itemsLabel = document.querySelector<HTMLElement>("#report-items-label");
    const itemsCard = document.querySelector<HTMLElement>("#report-items-card");
    const tableHeaders = document.querySelector<HTMLTableRowElement>("#report-table-headers");
    const customerFilter = document.querySelector<HTMLDivElement>("#report-customer-filter");
    const customerSearchInput = document.querySelector<HTMLInputElement>("#report-customer-search");
    const customerIdInput = document.querySelector<HTMLInputElement>("#report-customer-id");
    const customerResults = document.querySelector<HTMLDivElement>("#report-customer-results");
    const customerSelected = document.querySelector<HTMLParagraphElement>("#report-customer-selected");
    const sellerErrorElement = document.querySelector<HTMLParagraphElement>("#report-seller-error");

    const pageSize = 10;
    let currentPage = 1;

    let reportSales: OrderReport[] = [];
    let reportPurchase: PurchaseReport[] = [];
    let reportProfit: ProfitReportSale[] = [];

    let customers: Customer[] = [];

    function configureReport(): void {
        const config = reportConfig[reportTypeSelect!.value as ReportType];

        const title = document.querySelector<HTMLElement>("#report-results-title");
        const vendorFilter = document.querySelector<HTMLDivElement>("#report-vendor-filter");
        const sellerSelect = document.querySelector<HTMLSelectElement>("#report-seller-filter");

        if (!config) {
            if (title) title.textContent = "";
            if (vendorFilter) vendorFilter.hidden = true;
            if (customerFilter) customerFilter.hidden = true;
            if (sellerSelect) sellerSelect.hidden = true;
            itemsCard!.hidden = true;
            tableHeaders!.innerHTML = "";
            return;
        }

        if (title) title.textContent = config.title;

        totalLabel!.textContent = config.totalLabel;
        countLabel!.textContent = config.countLabel;

        itemsCard!.hidden = !config.showItemsCard;

        if (config.itemsLabel) {
            itemsLabel!.textContent = config.itemsLabel;
        }

        if (vendorFilter) {
            vendorFilter.hidden = !config.showVendorFilter;
        }

        if (customerFilter) {
            customerFilter.hidden = !config.showCustomerFilter;
        }

        if (sellerSelect) {
            sellerSelect.hidden = !config.showSellerFilter;
        }

        tableHeaders!.innerHTML = config.headers
            .map((header) => {
                const className =
                    header === "Total" ? ' class="report-table-number"' : "";

                return `<th${className}>${header}</th>`;
            })
            .join("");
        
    }

    function clearReportTable(): void {
        dateFromInput!.value = todayString;
        dateToInput!.value = todayString;
        salesTableBody!.innerHTML = "";
        paginationInfo!.textContent = "";
        currentPageElement!.textContent = "";

        previousPageButton!.disabled = true;
        nextPageButton!.disabled = true;
    }

    function clearReportResults(): void {

        totalSoldElement!.textContent = formatCurrency(0);
        salesCountElement!.textContent = "0";
        itemsSoldElement!.textContent = "0";

        reportSales = [];
        reportPurchase = [];
        reportProfit = [];

        currentPage = 1;
        clearReportTable();
        errorElement!.textContent = "";
        emptyMessage!.hidden = true;

        reportContent!.hidden = !reportTypeSelect!.value;
        reportResults!.hidden = true; 

        customerSearchInput!.value = "";
        customerIdInput!.value = "";
        customerResults!.innerHTML = "";
        customerResults!.hidden = true;
        customerSelected!.textContent = "";
        customerSelected!.hidden = true;
    }
    
    function renderTable<T>(data: T[], renderRow: (item: T) => string, emptyLabel: string): void {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize);

        if (totalPages === 0) {
            currentPage = 1;
            salesTableBody!.innerHTML = "";
            paginationInfo!.textContent = `0 ${emptyLabel}`;
            currentPageElement!.textContent = "";
            previousPageButton!.disabled = true;
            nextPageButton!.disabled = true;
            return;
        }

        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const pageData = data.slice(startIndex, endIndex);

        salesTableBody!.innerHTML = pageData.map(renderRow).join("");

        paginationInfo!.textContent =`Mostrando ${startIndex + 1}–${endIndex} de ${totalItems} ${emptyLabel}`;

        currentPageElement!.textContent =`Página ${currentPage} de ${totalPages}`;

        previousPageButton!.disabled = currentPage === 1;
        nextPageButton!.disabled = currentPage === totalPages;
    }

    
    function renderSalesTable(): void {
        renderTable(
            reportSales,
            (sale) => `
                <tr>
                    <td>${String(sale.number).padStart(8, "0")}</td>
                    <td>${new Date(`${sale.date.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR")}</td>
                    <td>${sale.customerName}</td>
                    <td>${sale.sellerName}</td>
                    <td>${formatCurrency(sale.total)}</td>
                </tr>
            `,
            "comprobantes",
        );
    }

    function renderPurchaseTable(): void {
        renderTable(
            reportPurchase,
            (purchase) => `
                <tr>
                    <td>${String(purchase.number).padStart(8, "0")}</td>
                    <td>${new Date(`${purchase.date.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR")}</td>
                    <td>${purchase.vendorName}</td>
                    <td>${formatCurrency(purchase.total)}</td>
                </tr>
            `,
            "comprobantes",
        );
    }

    function renderProfitTable(): void {
        renderTable(
            reportProfit,
            (sale) => `
                <tr>
                    <td>${String(sale.number).padStart(8, "0")}</td>
                    <td>${new Date(sale.date).toLocaleDateString("es-AR")}</td>
                    <td>${sale.customerName}</td>
                    <td>${sale.sellerName}</td>
                    <td class="report-table-number">
                        ${formatCurrency(sale.profit)}
                    </td>
                </tr>
            `,
            "No hay ventas para el período seleccionado."
        );
    }



    const reportHandlers: Record<string,{getTotalItems: () => number; renderTable: () => void; generate: () => Promise<void>;}> = {
        "sales-period": {
            getTotalItems: () => reportSales.length,
            renderTable: renderSalesTable,
            generate: generateSalesReport,
        },
        "purchases-period": {
            getTotalItems: () => reportPurchase.length,
            renderTable: renderPurchaseTable,
            generate: generatePurchasesReport,
        },
        "profit-period": {
            getTotalItems: () => reportProfit.length,
            renderTable: renderProfitTable,
            generate: generateProfitReport,
        },
        "sales-customer": {
            getTotalItems: () => reportSales.length,
            renderTable: renderSalesTable,
            generate: generateSalesByCustomerReport,
        },
        "sales-seller": {
            getTotalItems: () => reportSales.length,
            renderTable: renderSalesTable,
            generate: generateSalesBySellerReport,
        },
    };
    
    function renderCurrentTable(): void {
        const handler = reportHandlers[reportTypeSelect!.value];

        if (!handler) {
            clearReportTable();
            return;
        }

        handler.renderTable();
    }

    nextPageButton!.addEventListener("click", () => {
        const handler = reportHandlers[reportTypeSelect.value];

        if (!handler) return;

        const totalPages = Math.ceil(
            handler.getTotalItems() / pageSize
        );

        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentTable();
        }
    });

    previousPageButton!.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentTable();
        }
    });
 
    function resetGenerateButton(): void {
        generateButton!.disabled = false;
        generateButton!.textContent = "Generar informe";
    }

    function validateReportDates(): {dateFrom: string; dateTo: string;} | null {
        const dateFrom = dateFromInput!.value;
        const dateTo = dateToInput!.value;

        if (!dateFrom || !dateTo) {
            errorElement!.textContent = "Completá la fecha desde y la fecha hasta.";
            return null;
        }

        if (dateFrom > dateTo) {
            errorElement!.textContent = "La fecha desde no puede ser posterior a la fecha hasta.";
            return null;
        }

        return { dateFrom, dateTo };
    }

    async function generateSalesBySellerReport(): Promise<void> {
        const dates = validateReportDates();
        if (!dates) return;
        const { dateFrom, dateTo } = dates;
        try {
            const sellerSelect = document.querySelector<HTMLSelectElement>("#report-seller");
            const sellerId = Number(sellerSelect!.value);
            console.log("Selected seller ID:", sellerId);
        if (!Number.isInteger(sellerId) || sellerId <= 0) {
            sellerErrorElement!.textContent = "Seleccioná un vendedor de la lista.";
            sellerErrorElement!.hidden = false;
            return;
        }
            const report = await getSalesBySeller(sellerId,
                {
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                }
            );

            reportResults!.hidden = false;

            reportSales = report.sales.filter((sale) => !sale.cancelled);
            totalSoldElement!.textContent = formatCurrency(report.totalAmount);
            salesCountElement!.textContent = report.salesCount.toLocaleString("es-AR");
            itemsSoldElement!.textContent = "";
            emptyMessage!.hidden = report.salesCount > 0;
            currentPage = 1;
            renderSalesTable();

        } catch (error) {
            console.error("Error al generar el reporte de ventas por vendedor:", error);
            errorElement!.textContent = "No se pudo generar el reporte de ventas por vendedor. Intentá nuevamente.";
        } finally {
            resetGenerateButton();
        }
    }

    async function generateSalesByCustomerReport(): Promise<void> {
        const dates = validateReportDates();
        const customerErrorElement = document.getElementById("report-customer-error");
        
        if (!dates) return;

        const customerId = Number(customerIdInput!.value);
        if (!customerIdInput!.value || !Number.isInteger(customerId)) {
            customerErrorElement!.textContent = "Seleccioná un cliente de la lista.";
            customerErrorElement!.hidden = false;
            return;
        }
        const { dateFrom, dateTo } = dates;
        try {
            const report = await getSalesByCustomer(customerId, {
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });

            reportResults!.hidden = false;

            reportSales = report.sales.filter((sale) => !sale.cancelled);
            currentPage = 1;
            renderSalesTable();

            const activeSales = report.sales.filter(
                (sale) => !sale.cancelled,
            );

            const itemsSold = activeSales.reduce(
                (total, sale) =>
                    total +
                    sale.details.reduce(
                        (detailTotal, detail) =>
                            detailTotal + detail.quantity,
                        0,
                    ),
                0,
            );

            totalSoldElement!.textContent = formatCurrency(
                activeSales.reduce((total, sale) => total + sale.total, 0),
            );

            salesCountElement!.textContent = activeSales.length.toLocaleString(
                "es-AR",
            );

            itemsSoldElement!.textContent = itemsSold.toLocaleString("es-AR");

            emptyMessage!.hidden = activeSales.length > 0;
        } catch (error) {
            console.error(
                "Error al generar el reporte de ventas por cliente:",
                error,
            );

            errorElement!.textContent =
                "No se pudo generar el reporte de ventas por cliente. Intentá nuevamente.";
        } finally {
            resetGenerateButton();
            customerErrorElement!.hidden = true;
            customerErrorElement!.textContent = "";
        }
    }
    async function generateProfitReport(): Promise<void> {
        const dates = validateReportDates();

        if (!dates) return;

        const { dateFrom, dateTo } = dates;

        errorElement!.textContent = "";
        emptyMessage!.hidden = true;

        generateButton!.disabled = true;
        generateButton!.textContent = "Generando...";

        try {
            const report = await getProfitByPeriod({
                dateFrom,
                dateTo,
            });

            reportProfit = report.sales;
            currentPage = 1;

            totalSoldElement!.textContent =
                formatCurrency(report.totalProfit);

            salesCountElement!.textContent =
                report.salesCount.toString();

            reportResults!.hidden = false;

            emptyMessage!.hidden = report.salesCount > 0;

            renderCurrentTable();
        } catch (error) {
            console.error("Error al generar el informe de ganancias:", error);

            errorElement!.textContent =
                "No se pudo generar el informe de ganancias. Intentá nuevamente.";

            reportProfit = [];
            clearReportTable();
        } finally {
            resetGenerateButton();
        }
    }

    async function generatePurchasesReport(): Promise<void> {
        const dates = validateReportDates();
        if (!dates) return;
        const { dateFrom, dateTo } = dates;

        try {
            const vendorSelect = document.querySelector<HTMLSelectElement>("#report-vendor");
            const vendorId = vendorSelect!.value || undefined;
            const report = await getPurchasesReport({
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                vendorId: vendorId ? Number(vendorId) : undefined
            });

            reportResults!.hidden = false;

            reportPurchase = report.purchases.filter((sale) => !sale.cancelled);
            totalSoldElement!.textContent = formatCurrency(report.totalAmount);
            salesCountElement!.textContent = report.purchaseCount.toLocaleString("es-AR");
            itemsSoldElement!.textContent = "";
            emptyMessage!.hidden = report.purchaseCount > 0;
            currentPage = 1;
            renderPurchaseTable();

        } catch (error) {
            console.error("Error al generar el reporte de compras:", error);
            errorElement!.textContent = "No se pudo generar el reporte de compras. Intentá nuevamente.";
        } finally {
            resetGenerateButton();
        }

    }

    async function generateSalesReport(): Promise<void> {
        const dates = validateReportDates();
        if (!dates) return;
        const { dateFrom, dateTo } = dates;
        try {
            const report = await getSalesReport({
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });

            reportResults!.hidden = false;

            reportSales = report.sales.filter((sale) => !sale.cancelled);
            currentPage = 1;
            renderSalesTable();

            const activeSales = report.sales.filter(
                (sale) => !sale.cancelled,
            );

            const itemsSold = activeSales.reduce(
                (total, sale) =>
                total +
                sale.details.reduce(
                    (detailTotal, detail) => detailTotal + detail.quantity,
                    0,
                ),
                0,
            );

            totalSoldElement!.textContent = formatCurrency(report.totalAmount);
            salesCountElement!.textContent = report.salesCount.toLocaleString(
                "es-AR",
            );
            itemsSoldElement!.textContent = itemsSold.toLocaleString("es-AR");

            emptyMessage!.hidden = report.salesCount > 0;
        } catch (error) {
            console.error("Error al generar el reporte de ventas:", error);
            errorElement!.textContent = "No se pudo generar el reporte de ventas. Intentá nuevamente.";
        } finally {
            resetGenerateButton();
        }
    }

    generateButton!.addEventListener("click", async () => {
        const handler = reportHandlers[reportTypeSelect.value];

        if (!handler) return;

        await handler.generate();
    });

            
    async function loadCustomers(): Promise<void> {
        if (customers.length > 0) 
            return;

        try {
            customers = await getCustomers();

            await initCustomerSearch({
                input: customerSearchInput!,
                hiddenInput: customerIdInput!,
                results: customerResults!,
                selectedMessage: customerSelected!,
                customers: customers,
                onSelect: (customer) => {
                    customerIdInput!.value = String(customer.id);
                },
            });
        } catch (error) {
            console.error("Error al cargar los clientes del reporte:",error);
            throw error;
        }
    }


}

async function loadSellers(): Promise<void> {
    const sellerSelect = document.querySelector<HTMLSelectElement>("#report-seller");
    if (sellerSelect!.length > 1) {
        return;
    }

    try {
        const sellers = (await getUser()).filter(user => user.role === "Seller");
        populateSelect(sellerSelect!, sellers, "Seleccioná un vendedor");
    } catch (error) {
        console.error("Error al cargar las opciones del reporte:", error);
        throw error;
    }
}

        

async function loadVendors(): Promise<void> {
    const vendorSelect = document.querySelector<HTMLSelectElement>("#report-vendor");
    if (vendorSelect!.length > 1) {
        return;
    }

    try {
        const vendors = await getVendors();
        populateSelect(vendorSelect!, vendors, "Seleccioná un proveedor");
    } catch (error) {
        console.error("Error al cargar las opciones del reporte:", error);
        throw error;
    }
}

