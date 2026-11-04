import salesHtml from "./sales.html?raw";
import { renderLayout } from "../../shared/layout";
import { getOrdersByFilter, cancelOrder, type OrderFilter, type Order } from "../../../services/orders/orderService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { populateSelect } from "../../../utils/selectOptions";
import { sortItems } from "../../../utils/sort";
import { formatDate, formatCurrency } from "../../../utils/formatsUtils";
import { navigate } from "../../../router/router";
import { getUser } from "../../../services/users/userService";
import { initCustomerSearch } from "../../../components/customerSearch/customerSearch";
import { getCustomers, type Customer } from "../../../services/customers/customerService";
import { getCurrentUser } from "../../../services/auth/authSession";


const pagination = createPaginationState<Order>();
const currentUser = getCurrentUser();
let currentSortColumn: keyof Order | null = null;
let currentSortDirection: "asc" | "desc" | null = null;
let customers: Customer[] = [];

    
export function renderSales(): void {
    renderLayout(salesHtml);

    const crudContainer = document.querySelector<HTMLElement>("#sales-crud");
    if (!crudContainer) 
        return;

    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-sales");
    searchButton?.addEventListener("click", searchSales);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchSales();
            }
        });
    });

    const addSaleButton = document.querySelector<HTMLButtonElement>("#new-sale-button");

    addSaleButton?.addEventListener("click", () => {
        if (currentUser?.role !== "Admin") {
            navigate("/seller/sales/create");
        } else {
            navigate("/admin/sales/create");
        }
    });

    const dateFromInput = document.querySelector<HTMLInputElement>("#sale-date-from");
    const dateToInput = document.querySelector<HTMLInputElement>("#sale-date-to");
    
    if (!dateFromInput || !dateToInput) 
        return;
    
    const today = new Date().toISOString().split("T")[0];
    const formattedToday = new Date(today).toLocaleDateString("es-AR").split("/").reverse().join("-");

    dateToInput.value = formattedToday;
    dateFromInput.value = formattedToday;

    loadSalesFormOptions();
    loadSalesCustomers();

    crudContainer.addEventListener("click",handleSaleAction);
}

async function loadSalesFormOptions(): Promise<void> {
    const sellerSelectFilter = document.querySelector<HTMLSelectElement>("#sales-seller");
    
    if (!sellerSelectFilter) {
        throw new Error("No se encontró el select de vendedor.");
    }


    if (currentUser?.role !== "Admin") {
       sellerSelectFilter.disabled = true;
       sellerSelectFilter.add(new Option(currentUser!.name, String(currentUser!.id)));
       sellerSelectFilter.value = String(currentUser!.id);
       return;
    }
    


    const [users] = await Promise.all([
        getUser(),
    ]);

    const sellers = users.filter(user => user.role === "Seller");

    populateSelect(sellerSelectFilter, sellers, "Todos");
}

async function searchSales(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-sales");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadSales();
        },
        "Buscando..."
    );

}


async function loadSalesCustomers(): Promise<void> {
    const input = document.querySelector<HTMLInputElement>("#sales-customer-search");
    const hiddenInput = document.querySelector<HTMLInputElement>("#sales-customer-id");
    const results = document.querySelector<HTMLDivElement>("#sales-customer-results");
    const selectedMessage = document.querySelector<HTMLParagraphElement>("#sales-customer-selected");

    if (!input || !hiddenInput || !results || !selectedMessage) 
        throw new Error("No se pudo inicializar la búsqueda de clientes.");

    customers = await getCustomers();

    await initCustomerSearch({
        input,
        hiddenInput,
        results,
        selectedMessage,
        customers,
        onSelect: (customer) => {
            hiddenInput.value = String(customer.id);
        },
    });
}

async function loadSales(): Promise<void> {   
    const numberInput = document.querySelector<HTMLInputElement>("#sale-search");
    const sellerSelect = document.querySelector<HTMLSelectElement>("#sales-seller");
    const customerSelected = document.querySelector<HTMLInputElement>("#sales-customer-id");
    const purchaseDateFromInput = document.querySelector<HTMLInputElement>("#sale-date-from");
    const purchaseDateToInput = document.querySelector<HTMLInputElement>("#sale-date-to");

    const crudContainer = document.querySelector<HTMLElement>("#sales-crud");
    if (!crudContainer) 
        return;
    
    const purchaseNumberValue = numberInput?.value.trim();

    const filter: OrderFilter = {
        number: purchaseNumberValue && !Number.isNaN(Number(purchaseNumberValue)) ? Number(purchaseNumberValue) : undefined,
        sellerId: sellerSelect?.value ? parseInt(sellerSelect.value) : undefined,
        dateFrom: purchaseDateFromInput?.value || undefined,
        dateTo: purchaseDateToInput?.value || undefined,
        customerId: customerSelected?.value ? parseInt(customerSelected.value) : undefined
    };

    try {

        const sales = await getOrdersByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (sales.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;
            pagination.totalItems = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = sales.items;
        pagination.totalPages = sales.totalPages;
        pagination.totalItems = sales.totalItems;

        showCrudState(crudContainer, "results");

        renderSalesPage();

        } catch (error) {
            alert("Error al buscar ventas: " + error);
    }
}

function renderSalesPage(): void {
    renderSalesTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#sales-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#sales-pagination");

    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadSales();
        }
    });
}


function renderSalesTable(sales: Order[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#sales-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Ventas</h3>
            <span class="crud-count">
                ${pagination.totalItems} ventas
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="number" class="${currentSortColumn === "number" ? "is-sorted" : ""}">
                            Número${getSortIndicator("number")}
                        </th>
                        <th data-sort="customerName" class="${currentSortColumn === "customerName" ? "is-sorted" : ""}">
                            Cliente${getSortIndicator("customerName")}
                        </th>
                        <th data-sort="sellerName" class="${currentSortColumn === "sellerName" ? "is-sorted" : ""}">
                            Vendedor${getSortIndicator("sellerName")}
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
                    ${sales.map(sale => `
                        <tr>
                            <td>${sale.number}</td>
                            <td>${sale.customerName}</td>
                            <td>${sale.sellerName}</td>
                            <td>${formatDate(sale.date)}</td>
                            <td>${sale.total !== undefined ? formatCurrency(sale.total) : "-"}</td>
                            <td>${sale.cancelled ? "Sí" : "No"}</td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Ver detalle" data-sale-id="${sale.id}">🔍</button>
                                    ${!sale.cancelled && currentUser?.role === "Admin" ? `
                                                <button class="btn-icon btn-delete" type="button" title="Cancelar" data-sale-id="${sale.id}">🗑</button>
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

function getSortIndicator(column: keyof Order): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}


async function handleSaleAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Order;
        sortSales(column);
        return;
    }

    const viewButton =target.closest<HTMLButtonElement>(".btn-edit");
    if (viewButton) {
        const saleId = Number(viewButton.dataset.saleId);
        const sale = pagination.items.find(sale => Number(sale.id) === saleId);
        if (!sale) 
            return;

        if(currentUser?.role !== "Admin")
            navigate(`/seller/sales/${sale.id}`);
        else
            navigate(`/admin/sales/${sale.id}`);
        return;

    }


    //Eliminar compra
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const saleId = Number(deleteButton.dataset.saleId);
        const confirmed = confirm("¿Estás seguro de que querés cancelar esta venta?");
        if (!confirmed) 
            return;

        try {
            await cancelOrder(saleId);
            alert("Venta cancelada exitosamente.");
            await searchSales();
        } catch (error) {
            console.error("Error al cancelar la venta:",error);
            alert("No se pudo cancelar la venta. Intentá nuevamente.");
        }
        return;
    } 

}


function sortSales(column: keyof Order): void {
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

    renderSalesPage();
}

