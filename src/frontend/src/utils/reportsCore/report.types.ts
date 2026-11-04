export interface ReportFilters { dateFrom: string; dateTo: string; customerId?: number; vendorId?: number; sellerId?: number; }

export type ReportFilterType = | "customer" | "vendor" | "seller";

export type ReportColumnFormat = | "text" | "currency" | "date" | "number" ;

export interface ReportColumn<T> { key: keyof T; label: string; format?: ReportColumnFormat; }

export interface ReportSummary { total: number; count: number; items?: number; }

export interface ReportResult<T> { rows: T[]; summary: ReportSummary; }

export interface ReportFilterDefinition { type: ReportFilterType; label: string; placeholder?: string; }

export interface ReportDefinition<T> { 
    id: string; 
    title: string;
    filters: ReportFilterType[]; filterDefinitions?: ReportFilterDefinition[];
    columns: ReportColumn<T>[];
    summaryLabels: { total: string; count: string; items?: string; };
    execute( filters: ReportFilters ): Promise<ReportResult<T>>; 
}