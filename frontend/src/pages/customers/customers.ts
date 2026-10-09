import customersHtml from "./customers.html?raw";

import { renderLayout } from "../shared/layout";
import { getCustomerByFilter, createCustomer, updateCustomer, delCustomer, type CustomerFilter, type Customer} from "../../services/customers/customerService";
import { renderPagination } from "../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../components/crud-state/crudState";
import { createPaginationState } from "../../components/pagination/paginationState";
import { withLoadingButton } from "../../components/loading/withLoadingButton";

const pagination = createPaginationState<Customer>();

let editingCustomerId: number | null = null;
let currentSortColumn: keyof Customer | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderCustomers(): void {
    renderLayout(customersHtml);

    const crudContainer = document.querySelector<HTMLElement>("#customers-crud");
    if (!crudContainer) 
        return;

    
    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-customers");
    searchButton?.addEventListener("click", searchCustomers);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchCustomers();
            }
        });
    });

    const addCustomerButton = document.querySelector<HTMLButtonElement>("#new-customer-button");

    addCustomerButton?.addEventListener("click",() => openCustomerModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#customer-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#customer-modal-cancel");
    closeModalButton?.addEventListener("click", closeCustomerModal);
    cancelModalButton?.addEventListener("click", closeCustomerModal);

    const customerForm = document.querySelector<HTMLFormElement>("#customer-form");
    customerForm?.addEventListener("submit", (event) => {
    const submitButton = customerForm.querySelector<HTMLButtonElement>('button[type="submit"]');

    void withLoadingButton(
        submitButton,
        () => handleCustomerSubmit(event),
        "Guardando..."
    );
});

    crudContainer.addEventListener("click",handleCustomerAction);
}

async function searchCustomers(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-customers");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadCustomers();
        },
        "Buscando..."
    );

}

async function loadCustomers(): Promise<void> {   
    const nameInput = document.querySelector<HTMLInputElement>("#customer-search");
    const phoneInput = document.querySelector<HTMLInputElement>("#customer-phone-filter");
    const emailInput = document.querySelector<HTMLInputElement>("#customer-email-filter");
    const documentInput = document.querySelector<HTMLInputElement>("#customer-document-filter");
    const statusSelect = document.querySelector<HTMLSelectElement>("#customer-status");

    const crudContainer = document.querySelector<HTMLElement>("#customers-crud");
    if (!crudContainer) 
        return;
    
    const filter: CustomerFilter = {
        name: nameInput?.value.trim() || undefined,
        phone: phoneInput?.value.trim() || undefined,
        email: emailInput?.value.trim() || undefined,
        document: documentInput?.value.trim() || undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };

    try {

        const customers = await getCustomerByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (customers.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = customers.items;
        pagination.totalPages = customers.totalPages;

        showCrudState(crudContainer, "results");

        renderCustomersPage();

        } catch (error) {
            alert("Error al buscar clientes: " + error);
    }
}

function renderCustomersTable(customers: Customer[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#customers-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Clientes</h3>
            <span class="crud-count">
                ${customers.length} clientes
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="name" class="${currentSortColumn === "name" ? "is-sorted" : ""}">
                            Nombre${getSortIndicator("name")}
                        </th>
                        <th data-sort="document" class="${currentSortColumn === "document" ? "is-sorted" : ""}">
                            Documento${getSortIndicator("document")}
                        </th>
                        <th data-sort="phone" class="${currentSortColumn === "phone" ? "is-sorted" : ""}">
                            Teléfono${getSortIndicator("phone")}
                        </th>
                        <th data-sort="email" class="${currentSortColumn === "email" ? "is-sorted" : ""}">
                            Email${getSortIndicator("email")}
                        </th>
                        <th data-sort="city" class="${currentSortColumn === "city" ? "is-sorted" : ""}">
                            Ciudad${getSortIndicator("city")}
                        </th>
                        <th data-sort="active" class="${currentSortColumn === "active" ? "is-sorted" : ""}">
                            Estado${getSortIndicator("active")}
                        </th>
                        <th class="crud-actions-heading">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${customers.map(customer => `
                        <tr>
                            <td>${customer.name}</td>
                            <td>${customer.document}</td>
                            <td>${customer.phone ?? "-"}</td>
                            <td>${customer.email ?? "-"}</td>
                            <td>${customer.city ?? "-"}</td>
                            <td>
                                <span class="status-badge ${customer.active ? "is-active" : "is-inactive"}">
                                    ${customer.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-customer-id="${customer.id}">✎</button>
                                    ${customer.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-customer-id="${customer.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-customer-id="${customer.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="customers-pagination"></div>
    `;

}

function renderCustomersPage(): void {

    renderCustomersTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#customers-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#customers-pagination");

    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadCustomers();
        }
    });
}

function openCustomerModal(customer?: Customer): void {
    const modal = document.querySelector<HTMLElement>("#customer-modal");
    if (!modal) 
        return;

    editingCustomerId = customer?.id ?? null;

    const title = document.querySelector<HTMLElement>("#customer-modal-title");
    const nameInput = document.querySelector<HTMLInputElement>("#customer-name");
    const documentInput = document.querySelector<HTMLInputElement>("#customer-document");
    const phoneInput = document.querySelector<HTMLInputElement>("#customer-phone");
    const emailInput = document.querySelector<HTMLInputElement>("#customer-email");
    const addressInput = document.querySelector<HTMLInputElement>("#customer-address");
    const cityInput = document.querySelector<HTMLInputElement>("#customer-city");
    const observationsInput = document.querySelector<HTMLTextAreaElement>("#customer-observations");

    title!.textContent = customer ? "Editar cliente" : "Nuevo cliente";
    nameInput!.value = customer?.name ?? "";
    documentInput!.value = customer?.document ?? "";
    phoneInput!.value = customer?.phone ?? "";
    emailInput!.value = customer?.email ?? "";
    addressInput!.value = customer?.address ?? "";
    cityInput!.value = customer?.city ?? "";
    observationsInput!.value = customer?.observations ?? "";
    modal.hidden = false;
    nameInput?.focus();
    
}

function closeCustomerModal(): void {
    const modal = document.querySelector<HTMLElement>("#customer-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingCustomerId = null;
}

async function handleCustomerSubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();

    const nameInput = document.querySelector<HTMLInputElement>("#customer-name");
    const documentInput = document.querySelector<HTMLInputElement>("#customer-document");
    const phoneInput = document.querySelector<HTMLInputElement>("#customer-phone");
    const emailInput = document.querySelector<HTMLInputElement>("#customer-email");
    const addressInput = document.querySelector<HTMLInputElement>("#customer-address");
    const cityInput = document.querySelector<HTMLInputElement>("#customer-city");
    const observationsInput = document.querySelector<HTMLTextAreaElement>("#customer-observations");
    
    const customer = {
        name: nameInput?.value.trim() ?? "",
        document: documentInput?.value.trim() ?? "",
        phone: phoneInput?.value.trim() || null,
        email: emailInput?.value.trim() || null,
        address: addressInput?.value.trim() || null,
        city: cityInput?.value.trim() || null,
        observations: observationsInput?.value.trim() || null
    };

    try {
        if (editingCustomerId) {
            await updateCustomer(editingCustomerId, customer);
            alert("Cliente actualizado exitosamente.");
        } else {
            await createCustomer(customer);
            alert("Cliente creado exitosamente.");
        }
        closeCustomerModal();
        await searchCustomers();

    } catch (error) {
        console.error("Error al crear el cliente:",error);
        alert("No se pudo crear el cliente. Intentá nuevamente.");
    }
}

async function handleCustomerAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Customer;
        sortCustomers(column);
        return;
    }

    //Editar cliente
    if (editButton) {
        const customerId = Number(editButton.dataset.customerId);
        const customer = pagination.items.find(customer => Number(customer.id) === customerId);
        if (!customer) 
            return;
        openCustomerModal(customer);
        return;
    }

    //Eliminar cliente
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const customerId = Number(deleteButton.dataset.customerId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar este cliente?");
        if (!confirmed) 
            return;

        try {
            await delCustomer(customerId);
            alert("Cliente desactivado exitosamente.");
            await searchCustomers();
        } catch (error) {
            console.error("Error al desactivar el cliente:",error);
            alert("No se pudo desactivar el cliente. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar cliente
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const customerId = Number(activateButton.dataset.customerId);
        const confirmed = confirm("¿Estás seguro de que querés activar este cliente?");
        if (!confirmed) 
            return;

        try {
            const customer = pagination.items.find(customer => Number(customer.id) === customerId);
            if (!customer) 
                return;
            await updateCustomer(customerId, customer);
            alert("Cliente activado exitosamente.");
            await searchCustomers();
        } catch (error) {
            console.error("Error al activar el cliente:", error);
            alert("No se pudo activar el cliente. Intentá nuevamente.");
        }

        return;
    }
}

function sortCustomers(column: keyof Customer): void {

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
        pagination.items.sort((a, b) => {
            const valueA = a[currentSortColumn!];
            const valueB = b[currentSortColumn!];
            if (valueA === valueB) 
                return 0;

            if (valueA == null) 
                return 1;

            if (valueB == null) 
                return -1;
            
            const comparison =
                String(valueA).localeCompare(
                    String(valueB),
                    "es",
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );

            return currentSortDirection === "asc" ? comparison : -comparison;
        });
    }

    renderCustomersTable(pagination.items);
}

function getSortIndicator(column: keyof Customer): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}