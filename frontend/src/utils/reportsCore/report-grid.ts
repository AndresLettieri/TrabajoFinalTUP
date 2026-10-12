import type { ReportColumn } from "./report.types";
import { formatCurrency } from "../../utils/formatsUtils";

export interface ReportGridPagination {
    currentPage: number;
    pageSize: number;
}

export interface ReportGridElements {
    headers: HTMLTableRowElement;
    body: HTMLTableSectionElement;
    paginationInfo: HTMLElement;
    currentPageElement: HTMLElement;
    previousPageButton: HTMLButtonElement;
    nextPageButton: HTMLButtonElement;
}

export function renderReportGrid<T>(
    elements: ReportGridElements,
    columns: ReportColumn<T>[],
    rows: T[],
    pagination: ReportGridPagination,
): number {
    const {
        headers,
        body,
        paginationInfo,
        currentPageElement,
        previousPageButton,
        nextPageButton,
    } = elements;

    const { currentPage, pageSize } = pagination;

    headers.replaceChildren();
    body.replaceChildren();

    for (const column of columns) {
        const th = document.createElement("th");
        th.textContent = column.label;

        if (column.format === "currency") {
            th.classList.add("report-table-number");
        }

        headers.appendChild(th);
    }

    const totalItems = rows.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const safePage =
        totalPages === 0
        ? 1
        : Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (safePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const pageRows = rows.slice(startIndex, endIndex);

    for (const row of pageRows) {
        const tr = document.createElement("tr");

        for (const column of columns) {
            const td = document.createElement("td");
            const value = row[column.key];

            switch (column.format) {
                case "currency":
                    td.textContent = formatCurrency(Number(value));
                    td.classList.add("report-table-number");
                    break;
                case "date": 
                    const date = value == null ? "" : String(value);
                    const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`,);
                    td.textContent = Number.isNaN(parsedDate.getTime())
                        ? date
                        : parsedDate.toLocaleDateString("es-AR");
                    break;
                case "number":
                    td.textContent = Number(value).toLocaleString("es-AR");
                    break;
                default:
                    td.textContent = String(value ?? "");
            }
            tr.appendChild(td);
        }
        body.appendChild(tr);
    }

    paginationInfo.textContent =
        totalItems === 0
        ? "0 resultados"
        : `Mostrando ${startIndex + 1}–${endIndex} de ${totalItems}`;

    currentPageElement.textContent =
        totalPages > 0
        ? `Página ${safePage} de ${totalPages}`
        : "";

    previousPageButton.disabled = safePage <= 1;


    nextPageButton.disabled =
        totalPages === 0 || safePage >= totalPages;

    return safePage;
}