export interface PaginationOptions {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function renderPagination(container: HTMLElement, options: PaginationOptions): void {
    const {currentPage, totalPages, onPageChange} = options;

    container.innerHTML = `
        <button type="button" class="btn btn-secondary" data-page="prev" ${currentPage === 1 ? "disabled" : ""}><<</button>
        <span class="pagination-info">
            Página <strong>${currentPage}</strong> de ${totalPages}
        </span>

        <button type="button" class="btn btn-secondary" data-page="next"${currentPage === totalPages ? "disabled" : ""}>>></button>
    `;

    const previousButton = container.querySelector<HTMLButtonElement>('[data-page="prev"]');
    const nextButton = container.querySelector<HTMLButtonElement>('[data-page="next"]');

    previousButton?.addEventListener("click", () => {
        onPageChange(currentPage - 1);
    });

    nextButton?.addEventListener("click", () => {
        onPageChange(currentPage + 1);
    });
}