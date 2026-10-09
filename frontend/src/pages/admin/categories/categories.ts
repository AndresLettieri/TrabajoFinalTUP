import categoriesHtml from "./categories.html?raw";

import { renderLayout } from "../../shared/layout";
import { getCategoryByFilter, createCategory, updateCategory, delCategory, type CategoryFilter, type Category, activateCategory} from "../../../services/categories/categoryService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";

const pagination = createPaginationState<Category>();

let editingCategoryId: number | null = null;
let currentSortColumn: keyof Category | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderCategories(): void {
    renderLayout(categoriesHtml);

    const crudContainer = document.querySelector<HTMLElement>("#categories-crud");
    if (!crudContainer) 
        return;

    
    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-categories");
    searchButton?.addEventListener("click", searchCategories);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
            searchCategories();
            }
        });
    });

    const addCategoryButton = document.querySelector<HTMLButtonElement>("#new-category-button");

    addCategoryButton?.addEventListener("click",() => openCategoryModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#category-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#category-modal-cancel");
    closeModalButton?.addEventListener("click", closeCategoryModal);
    cancelModalButton?.addEventListener("click", closeCategoryModal);

    const categoryForm = document.querySelector<HTMLFormElement>("#category-form");
    categoryForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitButton = categoryForm.querySelector<HTMLButtonElement>('button[type="submit"]');

        void withLoadingButton(
            submitButton,
            () => handleCategorySubmit(event),
            "Guardando..."
        );
    });

    crudContainer.addEventListener("click",handleCategoryAction);
}

async function searchCategories(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-categories");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadCategories();
        },
        "Buscando..."
    );
}

async function loadCategories(): Promise<void> {   
    const nameInput = document.querySelector<HTMLInputElement>("#category-search");
    const statusSelect = document.querySelector<HTMLSelectElement>("#category-status");

    const crudContainer = document.querySelector<HTMLElement>("#categories-crud");

    if (!crudContainer) 
        return;
    
    const filter: CategoryFilter = {
        name: nameInput?.value.trim() || undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };
    

    try {

        const categories = await getCategoryByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (categories.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = categories.items;
        pagination.totalPages = categories.totalPages;

        showCrudState(crudContainer, "results");

        renderCategoriesPage();

        } catch (error) {
            alert("Error al buscar categorías: " + error);
    }
}

function renderCategoriesTable(categories: Category[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#categories-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Categorías</h3>
            <span class="crud-count">
                ${categories.length} categorías
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
                    ${categories.map(category => `
                        <tr>
                            <td>${category.name}</td>
                            <td>
                                <span class="status-badge ${category.active ? "is-active" : "is-inactive"}">
                                    ${category.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-category-id="${category.id}">✎</button>
                                    ${category.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-category-id="${category.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-category-id="${category.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="categories-pagination"></div>
    `;

}

function renderCategoriesPage(): void {

    renderCategoriesTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#categories-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#categories-pagination");
    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadCategories();
        }
    });
}

function openCategoryModal(category?: Category): void {
    const modal = document.querySelector<HTMLElement>("#category-modal");
    if (!modal) 
        return;

    editingCategoryId = category?.id ?? null;

    const title = document.querySelector<HTMLElement>("#category-modal-title");
    const nameInput = document.querySelector<HTMLInputElement>("#category-name");

    title!.textContent = category ? "Editar categoría" : "Nueva categoría";
    nameInput!.value = category?.name ?? "";
    modal.hidden = false;
    nameInput?.focus();
    
}

function closeCategoryModal(): void {
    const modal = document.querySelector<HTMLElement>("#category-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingCategoryId = null;
}

async function handleCategorySubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();

    const nameInput = document.querySelector<HTMLInputElement>("#category-name");
    
    const category = {
        name: nameInput?.value.trim() ?? ""
    };

    try {
        if (editingCategoryId) {
            await updateCategory(editingCategoryId, category);
            alert("Categoría actualizada exitosamente.");
        } else {
            await createCategory(category);
            alert("Categoría creada exitosamente.");
        }
        closeCategoryModal();
        await searchCategories();

    } catch (error) {
        console.error("Error al crear la categoría:",error);
        alert("No se pudo crear la categoría o actualizarla. Intentá nuevamente.");
    }
}

async function handleCategoryAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Category;
        sortCategories(column);
        return;
    }

    //Editar categoría
    if (editButton) {
        const categoryId = Number(editButton.dataset.categoryId);
        const category = pagination.items.find(category => Number(category.id) === categoryId);
        if (!category) 
            return;
        openCategoryModal(category);
        return;
    }

    //Eliminar categoría
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const categoryId = Number(deleteButton.dataset.categoryId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar esta categoría?");
        if (!confirmed) 
            return;

        try {
            await delCategory(categoryId);
            console.log("Categoría desactivada:", categoryId);
            alert("Categoría desactivada exitosamente.");
            await searchCategories();
        } catch (error) {
            console.error("Error al desactivar la categoría:",error);
            alert("No se pudo desactivar la categoría. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar categoría
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const categoryId = Number(activateButton.dataset.categoryId);
        const confirmed = confirm("¿Estás seguro de que querés activar esta categoría?");
        if (!confirmed) 
            return;

        try {
            const category = pagination.items.find(category => Number(category.id) === categoryId);
            if (!category) 
                return;
            await activateCategory(categoryId);
            alert("Categoría activada exitosamente.");
            await searchCategories();
        } catch (error) {
            console.error("Error al activar la categoría:", error);
            alert("No se pudo activar la categoría. Intentá nuevamente.");
        }

        return;
    }
}

function sortCategories(column: keyof Category): void {

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

    renderCategoriesTable(pagination.items);
}

function getSortIndicator(column: keyof Category): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}