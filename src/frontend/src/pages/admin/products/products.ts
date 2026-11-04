import productsHtml from "./products.html?raw";

import { renderLayout } from "../../shared/layout";
import { getProductsByFilter, createProduct, updateProduct, 
    delProduct, activateProduct, type ProductFilter, type Product} from "../../../services/products/productsService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { getCategories } from "../../../services/categories/categoryService";
import { getBrands } from "../../../services/brands/brandService";
import { populateSelect } from "../../../utils/selectOptions";
import { sortItems } from "../../../utils/sort";

const pagination = createPaginationState<Product>();

let editingProductId: number | null = null;
let currentSortColumn: keyof Product | null = null;
let currentSortDirection: "asc" | "desc" | null = null;

export function renderProducts(): void {
    renderLayout(productsHtml);

    const crudContainer = document.querySelector<HTMLElement>("#products-crud");
    if (!crudContainer) 
        return;

    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-products");
    searchButton?.addEventListener("click", searchProducts);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchProducts();
            }
        });
    });

    const addProductButton = document.querySelector<HTMLButtonElement>("#new-product-button");

    addProductButton?.addEventListener("click",() => openProductModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#product-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#product-modal-cancel");
    closeModalButton?.addEventListener("click", closeProductModal);
    cancelModalButton?.addEventListener("click", closeProductModal);

    const productForm = document.querySelector<HTMLFormElement>("#product-form");
    productForm?.addEventListener("submit", (event) => {
        const submitButton = productForm.querySelector<HTMLButtonElement>('button[type="submit"]');

        void withLoadingButton(
            submitButton,
            () => handleProductSubmit(event),
            "Guardando..."
            );
    });

    loadProductFormOptions();

    crudContainer.addEventListener("click",handleProductAction);
}

async function loadProductFormOptions(): Promise<void> {
    const categorySelectFilter = document.querySelector<HTMLSelectElement>("#product-category-search");
    const categorySelectModal = document.querySelector<HTMLSelectElement>("#product-category");
    const brandSelectFilter = document.querySelector<HTMLSelectElement>("#product-brand-search");
    const brandSelectModal = document.querySelector<HTMLSelectElement>("#product-brand");


    if (!categorySelectFilter || !brandSelectFilter || !brandSelectModal || !categorySelectModal) {
        throw new Error("No se encontraron los select de categoría y marca.");
    }

    const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands(),
    ]);

    populateSelect(categorySelectFilter, categories, "Todas");
    populateSelect(brandSelectFilter, brands, "Todas");
    populateSelect(brandSelectModal, brands);
    populateSelect(categorySelectModal, categories);
}

async function searchProducts(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-products");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadProducts();
        },
        "Buscando..."
    );

}

async function loadProducts(): Promise<void> {   
    const codeInput = document.querySelector<HTMLInputElement>("#product-search");
    const descriptionInput = document.querySelector<HTMLInputElement>("#product-description-search");
    const barcodeInput = document.querySelector<HTMLInputElement>("#product-barcode-search");
    const categoryInput = document.querySelector<HTMLSelectElement>("#product-category-search");
    const brandInput = document.querySelector<HTMLSelectElement>("#product-brand-search");
    const statusSelect = document.querySelector<HTMLSelectElement>("#product-status");

    const crudContainer = document.querySelector<HTMLElement>("#products-crud");
    if (!crudContainer) 
        return;
    
    const filter: ProductFilter = {
        code: codeInput?.value.trim() || undefined,
        description: descriptionInput?.value.trim() || undefined,
        barcode: barcodeInput?.value.trim() || undefined,
        categoryId: categoryInput?.value ? parseInt(categoryInput.value) : undefined,
        brandId: brandInput?.value ? parseInt(brandInput.value) : undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };

    try {

        const products = await getProductsByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (products.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;
            pagination.totalItems = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }
        pagination.items = products.items;
        pagination.totalPages = products.totalPages;
        pagination.totalItems = products.totalItems;

        showCrudState(crudContainer, "results");

        renderProductsPage();

        } catch (error) {
            alert("Error al buscar clientes: " + error);
    }
}

function renderProductsTable(products: Product[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#products-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Productos</h3>
            <span class="crud-count">
                ${pagination.totalItems} productos
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="code" class="${currentSortColumn === "code" ? "is-sorted" : ""}">
                            Código${getSortIndicator("code")}
                        </th>
                        <th data-sort="description" class="${currentSortColumn === "description" ? "is-sorted" : ""}">
                            Descripción${getSortIndicator("description")}
                        </th>
                        <th data-sort="categoryName" class="${currentSortColumn === "categoryName" ? "is-sorted" : ""}">
                            Categoría${getSortIndicator("categoryName")}
                        </th>
                        <th data-sort="brandName" class="${currentSortColumn === "brandName" ? "is-sorted" : ""}">
                            Marca${getSortIndicator("brandName")}
                        </th>
                        <th data-sort="salePrice" class="${currentSortColumn === "salePrice" ? "is-sorted" : ""}">
                            Precio${getSortIndicator("salePrice")}
                        </th>
                        <th data-sort="stock" class="${currentSortColumn === "stock" ? "is-sorted" : ""}">
                            Stock${getSortIndicator("stock")}
                        </th>
                        <th data-sort="active" class="${currentSortColumn === "active" ? "is-sorted" : ""}">
                            Estado${getSortIndicator("active")}
                        </th>
                        <th class="crud-actions-heading">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${products.map(product => `
                        <tr>
                            <td>${product.code}</td>
                            <td>${product.description}</td>
                            <td>${product.categoryName}</td>
                            <td>${product.brandName}</td>
                            <td>${product.salePrice ?? "-"}</td>
                            <td>${product.stock ?? "-"}</td>
                            <td>
                                <span class="status-badge ${product.active ? "is-active" : "is-inactive"}">
                                    ${product.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-product-id="${product.id}">✎</button>
                                    ${product.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-product-id="${product.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-product-id="${product.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="products-pagination"></div>
    `;

}

function renderProductsPage(): void {
    renderProductsTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#products-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#products-pagination");

    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadProducts();
        }
    });
}

function openProductModal(product?: Product): void {
    const modal = document.querySelector<HTMLElement>("#product-modal");
    if (!modal) 
        return;

    editingProductId = product?.id ?? null;

    const title = document.querySelector<HTMLElement>("#product-modal-title");
    const codeInput = document.querySelector<HTMLInputElement>("#product-code");
    const descriptionInput = document.querySelector<HTMLInputElement>("#product-description");
    const barcodeInput = document.querySelector<HTMLInputElement>("#product-barcode");
    const categorySelect = document.querySelector<HTMLSelectElement>("#product-category");
    const brandSelect = document.querySelector<HTMLSelectElement>("#product-brand");
    const priceInput = document.querySelector<HTMLInputElement>("#product-price");
    const costInput = document.querySelector<HTMLInputElement>("#product-cost");
    const stockInput = document.querySelector<HTMLInputElement>("#product-stock");
    const minStockInput = document.querySelector<HTMLInputElement>("#product-min-stock");

    title!.textContent = product ? "Editar producto" : "Nuevo producto";
    codeInput!.value = product?.code ?? "";
    barcodeInput!.value = product?.barcode ?? "";
    descriptionInput!.value = product?.description ?? "";
    categorySelect!.value = product ? String(product.categoryId) : "";
    brandSelect!.value = product ? String(product.brandId) : "";
    priceInput!.value = product ? String(product.salePrice) : "";
    costInput!.value = product ? String(product.purchasePrice) : "";
    stockInput!.value = product ? String(product.stock) : "";
    minStockInput!.value = product ? String(product.minimumStock) : "";
    modal.hidden = false;
    codeInput?.focus();
    
}

function closeProductModal(): void {
    const modal = document.querySelector<HTMLElement>("#product-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingProductId = null;
}

async function handleProductSubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();

    const codeInput = document.querySelector<HTMLInputElement>("#product-code");
    const barcodeInput = document.querySelector<HTMLInputElement>("#product-barcode");
    const descriptionInput = document.querySelector<HTMLInputElement>("#product-description");
    const categorySelect = document.querySelector<HTMLSelectElement>("#product-category");
    const brandSelect = document.querySelector<HTMLSelectElement>("#product-brand");
    const priceInput = document.querySelector<HTMLInputElement>("#product-price");
    const costInput = document.querySelector<HTMLInputElement>("#product-cost");
    const stockInput = document.querySelector<HTMLInputElement>("#product-stock");
    const minStockInput = document.querySelector<HTMLInputElement>("#product-min-stock");
    
    const product = {
        code: codeInput?.value.trim() ?? "",
        barcode: barcodeInput?.value.trim() ?? "",
        description: descriptionInput?.value.trim() ?? "",
        categoryId: Number(categorySelect?.value.trim()),
        brandId: Number(brandSelect?.value.trim()),
        salePrice: Number(priceInput?.value.trim()),
        purchasePrice: Number(costInput?.value.trim()),
        stock: Number(stockInput?.value.trim()),
        minimumStock: Number(minStockInput?.value.trim())
    };

    try {
        if (editingProductId) {
            await updateProduct(editingProductId, product);
            alert("Producto actualizado exitosamente.");
        } else {
            await createProduct(product);
            alert("Producto creado exitosamente.");
        }
        closeProductModal();
        await searchProducts();

    } catch (error) {
        const message = error instanceof Error
        ? "Error: " + error.message
        : "No se pudo crear o actualizar el producto.";

        console.error("Error al crear o actualizar el producto:",error);
        alert(message);
    }
}

async function handleProductAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");

    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof Product;
        sortProducts(column);
        return;
    }

    //Editar producto
    if (editButton) {
        const productId = Number(editButton.dataset.productId);
        const product = pagination.items.find(product => Number(product.id) === productId);
        if (!product) 
            return;
        openProductModal(product);
        return;
    }

    //Eliminar producto
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const productId = Number(deleteButton.dataset.productId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar este producto?");
        if (!confirmed) 
            return;

        try {
            await delProduct(productId);
            alert("Producto desactivado exitosamente.");
            await searchProducts();
        } catch (error) {
            console.error("Error al desactivar el producto:",error);
            alert("No se pudo desactivar el producto. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar producto
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const productId = Number(activateButton.dataset.productId);
        const confirmed = confirm("¿Estás seguro de que querés activar este producto?");
        if (!confirmed) 
            return;

        try {
            const product = pagination.items.find(product => Number(product.id) === productId);
            if (!product) 
                return;
            await activateProduct(productId); 
            alert("Producto activado exitosamente.");
            await searchProducts();
        } catch (error) {
            console.error("Error al activar el producto:", error);
            alert("No se pudo activar el producto. Intentá nuevamente.");
        }

        return;
    }
}

function sortProducts(column: keyof Product): void {
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

    renderProductsPage();
}



function getSortIndicator(column: keyof Product): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}