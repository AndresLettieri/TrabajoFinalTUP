import type { ReportFilterType } from "./report.types";

export interface ReportFilterElements {
    vendorFilter: HTMLDivElement;
    customerFilter: HTMLDivElement;
    sellerFilter: HTMLDivElement;
}

export function renderReportFilters(filters: ReportFilterType[], elements: ReportFilterElements,): void {
    elements.vendorFilter.hidden = !filters.includes("vendor");
    elements.customerFilter.hidden = !filters.includes("customer");
    elements.sellerFilter.hidden = !filters.includes("seller");
}