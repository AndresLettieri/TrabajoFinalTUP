import reportsHtml from "./reports.html?raw";
import { renderLayout } from "../../shared/layout";
import { formatCurrency } from "../../../utils/formatsUtils";
import { reports } from "../../../utils/reportsCore/report.registry";
import { getReportById } from "../../../utils/reportsCore/report.registry";
import { renderReportGrid } from "../../../utils/reportsCore/report-grid";
import { renderReportFilters } from "../../../utils/reportsCore/report-filters";
import { loadReportFilterOptions } from "../../../utils/reportsCore/report-filter-options";


export function renderReports(): void {
    renderLayout(reportsHtml);
    
    const reportTypeSelect = document.querySelector<HTMLSelectElement>("#report-type");
    const reportContent = document.querySelector<HTMLDivElement>("#report-content");
    const generateButton = document.querySelector<HTMLButtonElement>("#generate-report-button");
    const totalSoldElement = document.querySelector<HTMLElement>("#report-total-sold");
    const salesCountElement = document.querySelector<HTMLElement>("#report-sales-count");
    const itemsSoldElement = document.querySelector<HTMLElement>("#report-items-sold");
    const errorElement = document.querySelector<HTMLParagraphElement>("#report-error");
    const filterErrorElement = document.querySelector<HTMLParagraphElement>("#report-filter-error");
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
    const vendorFilter = document.querySelector<HTMLDivElement>("#report-vendor-filter");
    const sellerFilter = document.querySelector<HTMLDivElement>("#report-seller-filter");



    if (!reportTypeSelect || !reportContent) 
        throw new Error("No se pudo inicializar el selector de reportes.");
    
    // Cargo los reportes disponibles en el selector dinamicamente
    for (const report of reports) {
        const option = document.createElement("option");
        option.value = report.id;
        option.textContent = report.title;
        reportTypeSelect.appendChild(option);
    }

    const options = Array.from(reportTypeSelect.options);
    options.sort((a, b) => a.textContent!.localeCompare(b.textContent!, "es"));
    options.forEach(option => reportTypeSelect.appendChild(option));


    let modularReportRows: unknown[] = [];

    async function executeModularReport(): Promise<void> {
        const reportId = reportTypeSelect!.value;
        const report = getReportById(reportId);

        if (!report) 
            return;

        const dateFrom = dateFromInput!.value;
        const dateTo = dateToInput!.value;

        // Limpiar el estado anterior.
        errorElement!.textContent = "";
        emptyMessage!.hidden = true;
        reportResults!.hidden = true;
        filterErrorElement!.textContent = "";
        filterErrorElement!.hidden = true;

        modularReportRows = [];
        currentPage = 1;

        salesTableBody!.replaceChildren();
        paginationInfo!.textContent = "";
        currentPageElement!.textContent = "";

        previousPageButton!.disabled = true;
        nextPageButton!.disabled = true;

        totalSoldElement!.textContent = formatCurrency(0);
        salesCountElement!.textContent = "0";
        itemsSoldElement!.textContent = "0";

        // Validar fechas.
        if (!dateFrom || !dateTo) {
            errorElement!.textContent = "Completá la fecha desde y la fecha hasta.";
            reportResults!.hidden = false;
            return;
        }
        if (dateFrom > dateTo) {
            errorElement!.textContent = "La fecha desde no puede ser posterior a la fecha hasta.";
            reportResults!.hidden = false;
            return;
        }

        generateButton!.disabled = true;
        generateButton!.textContent = "Generando...";

        try {
            const vendorSelect = document.querySelector<HTMLSelectElement>("#report-vendor");
            const sellerSelect = document.querySelector<HTMLSelectElement>("#report-seller");
            const customerIdInput = document.querySelector<HTMLInputElement>("#report-customer-id");
            const result = await report.execute({
                dateFrom,
                dateTo,
                vendorId: vendorSelect?.value ? Number(vendorSelect.value) : undefined,
                sellerId: sellerSelect?.value ? Number(sellerSelect.value) : undefined,
                customerId: customerIdInput?.value ? Number(customerIdInput.value) : undefined,
            });

            // Guardar los resultados para la paginación.
            modularReportRows = result.rows;
            currentPage = 1;

            // Renderizar la grilla y su paginación.
            currentPage = renderReportGrid(
                {
                    headers: tableHeaders!,
                    body: salesTableBody!,
                    paginationInfo: paginationInfo!,
                    currentPageElement: currentPageElement!,
                    previousPageButton: previousPageButton!,
                    nextPageButton: nextPageButton!,
                },
                report.columns,
                modularReportRows,
                {
                    currentPage,
                    pageSize,
                },
            );

            // Actualizar el resumen.
            totalLabel!.textContent = report.summaryLabels.total;
            countLabel!.textContent = report.summaryLabels.count;

            totalSoldElement!.textContent = formatCurrency(result.summary.total);
            salesCountElement!.textContent = result.summary.count.toLocaleString("es-AR");

            // Mostrar artículos únicamente cuando el reporte los informa.
            const hasItems = result.summary.items !== undefined;

            itemsCard!.hidden = !hasItems;

            if (hasItems) {
                itemsLabel!.textContent = report.summaryLabels.items ?? "Artículos";
                itemsSoldElement!.textContent = result.summary.items!.toLocaleString("es-AR");
            }

            // Mostrar resultados o mensaje de lista vacía.
            emptyMessage!.hidden = result.rows.length > 0;
            reportResults!.hidden = false;

        } catch (error) {
            console.error(`Error al generar el reporte ${reportId}:`,error,);
            // Evitar que queden resultados parciales.
            modularReportRows = [];
            salesTableBody!.replaceChildren();

            paginationInfo!.textContent = "0 resultados";
            currentPageElement!.textContent = "";

            previousPageButton!.disabled = true;
            nextPageButton!.disabled = true;

            totalSoldElement!.textContent = formatCurrency(0);
            salesCountElement!.textContent = "0";
            itemsSoldElement!.textContent = "0";

            emptyMessage!.hidden = true;
            
            errorElement!.textContent = error instanceof Error
                ? error.message
                : "No se pudo generar el reporte. Intentá nuevamente.";

        } finally {
            generateButton!.disabled = false;
            generateButton!.textContent = "Generar informe";
        }
    }


    function configureModularReport(): boolean {
        const report = getReportById(reportTypeSelect!.value);

        if (!report) 
            return false;
        
        const title = document.querySelector<HTMLElement>("#report-results-title",);
        if (title) 
            title.textContent = report.title;

        renderReportFilters(report.filters, {
            vendorFilter: vendorFilter!,
            customerFilter: customerFilter!,
            sellerFilter: sellerFilter!,
        });


        return true;
    }

    reportTypeSelect.addEventListener("change", () => {
        clearReportResults();

        if (configureModularReport()) {
            const report = getReportById(reportTypeSelect.value);
            if (report) 
                void loadReportFilterOptions(report.filters);
            
            return;
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

    const pageSize = 10;
    let currentPage = 1;

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
    
    nextPageButton!.addEventListener("click", () => {
        console.log(reportTypeSelect.value);
        if (getReportById(reportTypeSelect.value)) {
            currentPage++;

            const report = getReportById(reportTypeSelect.value);

            if (report) {
                currentPage = renderReportGrid(
                    {
                        headers: tableHeaders!,
                        body: salesTableBody!,
                        paginationInfo: paginationInfo!,
                        currentPageElement: currentPageElement!,
                        previousPageButton: previousPageButton!,
                        nextPageButton: nextPageButton!,
                    },
                    report.columns,
                    modularReportRows,
                    { currentPage, pageSize },
                );
            }
            return;
        }
    });

    previousPageButton!.addEventListener("click", () => {
        if (getReportById(reportTypeSelect.value)) {
            currentPage--;
            const report = getReportById(reportTypeSelect.value);

            if (report) {
                currentPage = renderReportGrid(
                    {
                        headers: tableHeaders!,
                        body: salesTableBody!,
                        paginationInfo: paginationInfo!,
                        currentPageElement: currentPageElement!,
                        previousPageButton: previousPageButton!,
                        nextPageButton: nextPageButton!,
                    },
                    report.columns,
                    modularReportRows,
                    { currentPage, pageSize },
                );
            }
            return;
        }
    });
 

    generateButton!.addEventListener("click", async () => {
        if (getReportById(reportTypeSelect.value)) {
            await executeModularReport();
            return;
        }
    });

}



