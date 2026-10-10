import vendorsHtml from "./vendors.html?raw";

import { renderLayout } from "../../shared/layout";
import { getVendorByFilter, createVendor, updateVendor, delVendor, activateVendor, type VendorFilter, type Vendor} from "../../../services/vendors/vendorService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { sortItems } from "../../../utils/sort";

const pagination = createPaginationState<Vendor>();

let editingVendorId: number | null = null;
let currentSortColumn: keyof Vendor | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderVendors(): void {
    renderLayout(vendorsHtml);

    const crudContainer = document.querySelector<HTMLElement>("#vendors-crud");
    if (!crudContainer) 
        return;

    
    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-vendors");
    searchButton?.addEventListener("click", searchVendors);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchVendors();
            }
        });
    });

    const addVendorButton = document.querySelector<HTMLButtonElement>("#new-vendor-button");

    addVendorButton?.addEventListener("click",() => openVendorModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#vendor-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#vendor-modal-cancel");
    closeModalButton?.addEventListener("click", closeVendorModal);
    cancelModalButton?.addEventListener("click", closeVendorModal);

    const vendorForm = document.querySelector<HTMLFormElement>("#vendor-form");
    vendorForm?.addEventListener("submit", (event) => {
    const submitButton = vendorForm.querySelector<HTMLButtonElement>('button[type="submit"]');

    void withLoadingButton(
        submitButton,
        () => handleVendorSubmit(event),
        "Guardando..."
    );
});

    crudContainer.addEventListener("click",handleVendorAction);
}

async function searchVendors(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-vendors");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadVendors();
        },
        "Buscando..."
    );

}

async function loadVendors(): Promise<void> {   
    const nameInput = document.querySelector<HTMLInputElement>("#vendor-search");
    const phoneInput = document.querySelector<HTMLInputElement>("#vendor-phone-filter");
    const emailInput = document.querySelector<HTMLInputElement>("#vendor-email-filter");
    const cityInput = document.querySelector<HTMLInputElement>("#vendor-city-filter");
    const statusSelect = document.querySelector<HTMLSelectElement>("#vendor-status");

    const crudContainer = document.querySelector<HTMLElement>("#vendors-crud");
    if (!crudContainer) 
        return;
    
    const filter: VendorFilter = {
        name: nameInput?.value.trim() || undefined,
        phone: phoneInput?.value.trim() || undefined,
        email: emailInput?.value.trim() || undefined,
        city: cityInput?.value.trim() || undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };

    try {

        const vendors = await getVendorByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (vendors.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;
            pagination.totalItems = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = vendors.items;
        pagination.totalPages = vendors.totalPages;
        pagination.totalItems = vendors.totalItems;

        showCrudState(crudContainer, "results");

        renderVendorsPage();

        } catch (error) {
            alert("Error al buscar clientes: " + error);
    }
}

function renderVendorsTable(vendors: Vendor[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#vendors-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Proveedores</h3>
            <span class="crud-count">
                ${pagination.totalItems} proveedores
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="name" class="${currentSortColumn === "name" ? "is-sorted" : ""}">
                            Nombre${getSortIndicator("name")}
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
                    ${vendors.map(vendor => `
                        <tr>
                            <td>${vendor.name}</td>
                            <td>${vendor.phone ?? "-"}</td>
                            <td>${vendor.email ?? "-"}</td>
                            <td>${vendor.city ?? "-"}</td>
                            <td>
                                <span class="status-badge ${vendor.active ? "is-active" : "is-inactive"}">
                                    ${vendor.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-vendor-id="${vendor.id}">✎</button>
                                    ${vendor.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-vendor-id="${vendor.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-vendor-id="${vendor.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="vendors-pagination"></div>
    `;

}

function renderVendorsPage(): void {

    renderVendorsTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#vendors-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#vendors-pagination");

    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadVendors();
        }
    });
}

function openVendorModal(vendor?: Vendor): void {
    const modal = document.querySelector<HTMLElement>("#vendor-modal");
    if (!modal) 
        return;

    editingVendorId = vendor?.id ?? null;

    const title = document.querySelector<HTMLElement>("#vendor-modal-title");
    const nameInput = document.querySelector<HTMLInputElement>("#vendor-name");
    const phoneInput = document.querySelector<HTMLInputElement>("#vendor-phone");
    const emailInput = document.querySelector<HTMLInputElement>("#vendor-email");
    const addressInput = document.querySelector<HTMLInputElement>("#vendor-address");
    const cityInput = document.querySelector<HTMLInputElement>("#vendor-city");
    const observationsInput = document.querySelector<HTMLTextAreaElement>("#vendor-observations");

    title!.textContent = vendor ? "Editar proveedor" : "Nuevo proveedor";
    nameInput!.value = vendor?.name ?? "";
    phoneInput!.value = vendor?.phone ?? "";
    emailInput!.value = vendor?.email ?? "";
    addressInput!.value = vendor?.address ?? "";
    cityInput!.value = vendor?.city ?? "";
    observationsInput!.value = vendor?.observations ?? "";
    modal.hidden = false;
    nameInput?.focus();
    
}

function closeVendorModal(): void {
    const modal = document.querySelector<HTMLElement>("#vendor-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingVendorId = null;
}

async function handleVendorSubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();

    const nameInput = document.querySelector<HTMLInputElement>("#vendor-name");
    const phoneInput = document.querySelector<HTMLInputElement>("#vendor-phone");
    const emailInput = document.querySelector<HTMLInputElement>("#vendor-email");
    const addressInput = document.querySelector<HTMLInputElement>("#vendor-address");
    const cityInput = document.querySelector<HTMLInputElement>("#vendor-city");
    const observationsInput = document.querySelector<HTMLTextAreaElement>("#vendor-observations");
    
    const vendor = {
        name: nameInput?.value.trim() ?? "",
        phone: phoneInput?.value.trim() || null,
        email: emailInput?.value.trim() || null,
        address: addressInput?.value.trim() || null,
        city: cityInput?.value.trim() || null,
        observations: observationsInput?.value.trim() || null
    };

    try {
        if (editingVendorId) {
            await updateVendor(editingVendorId, vendor);
            alert("Proveedor actualizado exitosamente.");
        } else {
            await createVendor(vendor);
            alert("Proveedor creado exitosamente.");
        }
        closeVendorModal();
        await searchVendors();

    } catch (error) {
        const message = error instanceof Error
        ? "Error: " + error.message
        : "No se pudo crear o actualizar el proveedor. Intentá nuevamente.";

        console.error("Error al crear o actualizar el proveedor:",error);
        alert(message);
    }
}

async function handleVendorAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Vendor;
        sortVendors(column);
        return;
    }

    //Editar proveedor
    if (editButton) {
        const vendorId = Number(editButton.dataset.vendorId);
        const vendor = pagination.items.find(vendor => Number(vendor.id) === vendorId);
        if (!vendor) 
            return;
        openVendorModal(vendor);
        return;
    }

    //Eliminar proveedor
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const vendorId = Number(deleteButton.dataset.vendorId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar este proveedor?");
        if (!confirmed) 
            return;

        try {
            await delVendor(vendorId);
            alert("Proveedor desactivado exitosamente.");
            await searchVendors();
        } catch (error) {
            console.error("Error al desactivar el proveedor:",error);
            alert("No se pudo desactivar el proveedor. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar proveedor
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const vendorId = Number(activateButton.dataset.vendorId);
        const confirmed = confirm("¿Estás seguro de que querés activar este proveedor?");
        if (!confirmed) 
            return;

        try {
            const vendor = pagination.items.find(vendor => Number(vendor.id) === vendorId);
            if (!vendor) 
                return;
            await activateVendor(vendorId); 
            alert("Proveedor activado exitosamente.");
            await searchVendors();
        } catch (error) {
            console.error("Error al activar el proveedor:", error);
            alert("No se pudo activar el proveedor. Intentá nuevamente.");
        }

        return;
    }
}

function sortVendors(column: keyof Vendor): void {
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

    renderVendorsPage();
}

function getSortIndicator(column: keyof Vendor): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}