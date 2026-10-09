import brandsHtml from "./brands.html?raw";

import { renderLayout } from "../../shared/layout";
import { getBrandByFilter, createBrand, updateBrand, delBrand, activateBrand, type BrandFilter, type Brand} from "../../../services/brands/brandService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";

const pagination = createPaginationState<Brand>();

let editingBrandId: number | null = null;
let currentSortColumn: keyof Brand | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderBrands(): void {
    renderLayout(brandsHtml);

    const crudContainer = document.querySelector<HTMLElement>("#brands-crud");
    if (!crudContainer) 
        return;

    
    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-brands");
    searchButton?.addEventListener("click", searchBrands);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchBrands();
            }
        });
    });

    const addBrandButton = document.querySelector<HTMLButtonElement>("#new-brand-button");

    addBrandButton?.addEventListener("click",() => openBrandModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#brand-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#brand-modal-cancel");
    closeModalButton?.addEventListener("click", closeBrandModal);
    cancelModalButton?.addEventListener("click", closeBrandModal);

    const brandForm = document.querySelector<HTMLFormElement>("#brand-form");
    brandForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitButton = brandForm.querySelector<HTMLButtonElement>('button[type="submit"]');

        void withLoadingButton(
            submitButton,
            () => handleBrandSubmit(event),
            "Guardando..."
        );
    });

    crudContainer.addEventListener("click",handleBrandAction);
}

async function searchBrands(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-brands");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadBrands();
        },
        "Buscando..."
    );
}

async function loadBrands(): Promise<void> {   
    const nameInput = document.querySelector<HTMLInputElement>("#brand-search");
    const statusSelect = document.querySelector<HTMLSelectElement>("#brand-status");

    const crudContainer = document.querySelector<HTMLElement>("#brands-crud");

    if (!crudContainer) 
        return;
    
    const filter: BrandFilter = {
        name: nameInput?.value.trim() || undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };
    

    try {

        const brands = await getBrandByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (brands.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = brands.items;
        pagination.totalPages = brands.totalPages;

        showCrudState(crudContainer, "results");

        renderBrandsPage();

        } catch (error) {
            alert("Error al buscar marcas: " + error);
    }
}

function renderBrandsTable(brands: Brand[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#brands-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Marcas</h3>
            <span class="crud-count">
                ${brands.length} marcas
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="name" class="${currentSortColumn === "name" ? "is-sorted" : ""}">
                            Nombre${getSortIndicator("name")}
                        </th>
                        <th data-sort="active" class="${currentSortColumn === "active" ? "is-sorted" : ""}">
                            Estado${getSortIndicator("active")}
                        </th>
                        <th class="crud-actions-heading">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${brands.map(brand => `
                        <tr>
                            <td>${brand.name}</td>
                            <td>
                                <span class="status-badge ${brand.active ? "is-active" : "is-inactive"}">
                                    ${brand.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-brand-id="${brand.id}">✎</button>
                                    ${brand.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-brand-id="${brand.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-brand-id="${brand.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="brands-pagination"></div>
    `;

}

function renderBrandsPage(): void {

    renderBrandsTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#brands-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#brands-pagination");
    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadBrands();
        }
    });
}

function openBrandModal(brand?: Brand): void {
    const modal = document.querySelector<HTMLElement>("#brand-modal");
    if (!modal) 
        return;

    editingBrandId = brand?.id ?? null;

    const title = document.querySelector<HTMLElement>("#brand-modal-title");
    const nameInput = document.querySelector<HTMLInputElement>("#brand-name");

    title!.textContent = brand ? "Editar marca" : "Nueva marca";
    nameInput!.value = brand?.name ?? "";
    modal.hidden = false;
    nameInput?.focus();
    
}

function closeBrandModal(): void {
    const modal = document.querySelector<HTMLElement>("#brand-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingBrandId = null;
}

async function handleBrandSubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();

    const nameInput = document.querySelector<HTMLInputElement>("#brand-name");
    
    const brand = {
        name: nameInput?.value.trim() ?? ""
    };

    try {
        if (editingBrandId) {
            await updateBrand(editingBrandId, brand);
            alert("Marca actualizada exitosamente.");
        } else {
            await createBrand(brand);
            alert("Marca creada exitosamente.");
        }
        closeBrandModal();
        await searchBrands();

    } catch (error) {
        console.error("Error al crear la marca:",error);
        alert("No se pudo crear la marca o actualizarla. Intentá nuevamente.");
    }
}

async function handleBrandAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Brand;
        sortBrands(column);
        return;
    }

    //Editar marca
    if (editButton) {
        const brandId = Number(editButton.dataset.brandId);
        const brand = pagination.items.find(brand => Number(brand.id) === brandId);
        if (!brand) 
            return;
        openBrandModal(brand);
        return;
    }

    //Eliminar marca
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const brandId = Number(deleteButton.dataset.brandId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar esta marca?");
        if (!confirmed) 
            return;

        try {
            await delBrand(brandId);
            alert("Marca desactivada exitosamente.");
            await searchBrands();
        } catch (error) {
            console.error("Error al desactivar la marca:",error);
            alert("No se pudo desactivar la marca. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar marca
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const brandId = Number(activateButton.dataset.brandId);
        const confirmed = confirm("¿Estás seguro de que querés activar esta marca?");
        if (!confirmed) 
            return;

        try {
            const brand = pagination.items.find(brand => Number(brand.id) === brandId);
            if (!brand) 
                return;
            await activateBrand(brandId);
            alert("Marca activada exitosamente.");
            await searchBrands();
        } catch (error) {
            console.error("Error al activar la marca:", error);
            alert("No se pudo activar la marca. Intentá nuevamente.");
        }

        return;
    }
}

function sortBrands(column: keyof Brand): void {

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

    renderBrandsTable(pagination.items);
}

function getSortIndicator(column: keyof Brand): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}