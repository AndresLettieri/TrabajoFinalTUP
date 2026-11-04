import purchasesHtml from "./purchases.html?raw";
import { renderLayout } from "../../shared/layout";
import { getPurchasesByFilter, cancelPurchase, type PurchaseFilter, type Purchase } from "../../../services/purchases/purchaseService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { getVendors } from "../../../services/vendors/vendorService";
import { populateSelect } from "../../../utils/selectOptions";
import { sortItems } from "../../../utils/sort";
import { formatDate, formatCurrency } from "../../../utils/formatsUtils";
import { navigate } from "../../../router/router";


const pagination = createPaginationState<Purchase>();
let currentSortColumn: keyof Purchase | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderPurchases(): void {
    renderLayout(purchasesHtml);

    
    const crudContainer = document.querySelector<HTMLElement>("#purchases-crud");
    if (!crudContainer) 
        return;

    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-purchases");
    searchButton?.addEventListener("click", searchPurchases);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchPurchases();
            }
        });
    });

    const addPurchaseButton = document.querySelector<HTMLButtonElement>("#new-purchase-button");

    addPurchaseButton?.addEventListener("click", () => {
        navigate("/admin/purchases/create");
    });

    loadPurchaseFormOptions();

    crudContainer.addEventListener("click",handlePurchaseAction);
}

async function loadPurchaseFormOptions(): Promise<void> {
    const vendorSelectFilter = document.querySelector<HTMLSelectElement>("#purchase-vendor-search");
    
    if (!vendorSelectFilter) {
        throw new Error("No se encontró el select de proveedor.");
    }

    const [vendors] = await Promise.all([
        getVendors(),
    ]);

    populateSelect(vendorSelectFilter, vendors, "Todos");
}

async function searchPurchases(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-purchases");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadPurchases();
        },
        "Buscando..."
    );

}


async function loadPurchases(): Promise<void> {   
    const numberInput = document.querySelector<HTMLInputElement>("#purchase-search");
    const vendorSelect = document.querySelector<HTMLSelectElement>("#purchase-vendor-search");
    const purchaseDateFromInput = document.querySelector<HTMLInputElement>("#purchase-date-from");
    const purchaseDateToInput = document.querySelector<HTMLInputElement>("#purchase-date-to");
    


    const crudContainer = document.querySelector<HTMLElement>("#purchases-crud");
    if (!crudContainer) 
        return;
    
    const purchaseNumberValue = numberInput?.value.trim();

    const filter: PurchaseFilter = {
        number: purchaseNumberValue && !Number.isNaN(Number(purchaseNumberValue)) ? Number(purchaseNumberValue) : undefined,
        vendorId: vendorSelect?.value ? parseInt(vendorSelect.value) : undefined,
        dateFrom: purchaseDateFromInput?.value || undefined,
        dateTo: purchaseDateToInput?.value || undefined
    };

    try {

        const purchases = await getPurchasesByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (purchases.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;
            pagination.totalItems = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = purchases.items;
        pagination.totalPages = purchases.totalPages;
        pagination.totalItems = purchases.totalItems;

        showCrudState(crudContainer, "results");

        renderPurchasesPage();

        } catch (error) {
            alert("Error al buscar compras: " + error);
    }
}

function renderPurchasesPage(): void {
    renderPurchasesTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#purchases-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#purchases-pagination");

    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadPurchases();
        }
    });
}


function renderPurchasesTable(purchases: Purchase[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#purchases-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Compras</h3>
            <span class="crud-count">
                ${pagination.totalItems} compras
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="number" class="${currentSortColumn === "number" ? "is-sorted" : ""}">
                            Número${getSortIndicator("number")}
                        </th>
                        <th data-sort="vendorName" class="${currentSortColumn === "vendorName" ? "is-sorted" : ""}">
                            Proveedor${getSortIndicator("vendorName")}
                        </th>
                        <th data-sort="date" class="${currentSortColumn === "date" ? "is-sorted" : ""}">
                            Fecha${getSortIndicator("date")}
                        </th>
                        <th data-sort="total" class="${currentSortColumn === "total" ? "is-sorted" : ""}">
                            Total${getSortIndicator("total")}
                        </th>
                        <th data-sort="cancelled" class="${currentSortColumn === "cancelled" ? "is-sorted" : ""}">
                            Cancelada${getSortIndicator("cancelled")}
                        </th>
                        <th class="crud-actions-heading">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${purchases.map(purchase => `
                        <tr>
                            <td>${purchase.number}</td>
                            <td>${purchase.vendorName}</td>
                            <td>${formatDate(purchase.date)}</td>
                            <td>${purchase.total !== undefined ? formatCurrency(purchase.total) : "-"}</td>
                            <td>${purchase.cancelled ? "Sí" : "No"}</td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Ver detalle" data-purchase-id="${purchase.id}">🔍</button>
                                    ${!purchase.cancelled? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-purchase-id="${purchase.id}">🗑</button>
                                            ` : ``}
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="purchases-pagination"></div>
    `;

}

function getSortIndicator(column: keyof Purchase): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}


async function handlePurchaseAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Purchase;
        sortPurchases(column);
        return;
    }

    const viewButton =target.closest<HTMLButtonElement>(".btn-edit");
    if (viewButton) {
        const purchaseId = Number(viewButton.dataset.purchaseId);
        const purchase = pagination.items.find(purchase => Number(purchase.id) === purchaseId);
        if (!purchase) 
            return;
        navigate(`/admin/purchases/${purchase.id}`);
    }


    //Eliminar compra
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const purchaseId = Number(deleteButton.dataset.purchaseId);
        const confirmed = confirm("¿Estás seguro de que querés cancelar esta compra?");
        if (!confirmed) 
            return;

        try {
            await cancelPurchase(purchaseId);
            alert("Compra cancelada exitosamente.");
            await searchPurchases();
        } catch (error) {
            console.error("Error al cancelar la compra:",error);
            alert("No se pudo cancelar la compra. Intentá nuevamente.");
        }
        return;
    } 

}


function sortPurchases(column: keyof Purchase): void {
    if (currentSortColumn !== column) {
        currentSortColumn = column;
        currentSortDirection = "asc";
    } else if (currentSortDirection === "asc") {
        currentSortDirection = "desc";
    } else {
        currentSortColumn = null;
        currentSortDirection = null;
    }

    if (currentSortColumn && currentSortDirection) {
        pagination.items = sortItems(
        pagination.items,
        currentSortColumn,
        currentSortDirection
    );
}

    renderPurchasesPage();
}

