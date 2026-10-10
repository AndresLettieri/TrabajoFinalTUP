export interface PaginationState<T> {
    currentPage: number;
    pageSize: number;
    items: T[];
    totalPages: number;
    totalItems: number;
}

export function createPaginationState<T>(
    pageSize = 10
): PaginationState<T> {
    return {
        currentPage: 1,
        pageSize,
        items: [],
        totalPages: 0,
        totalItems: 0
    };
}