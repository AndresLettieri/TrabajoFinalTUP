import productSelectorHtml from "./productSelector.html?raw";
import { getProductsByFilter, type Product, type ProductFilter,} from "../../services/products/productsService";
import { createPaginationState } from "../../components/pagination/paginationState";
import { withLoadingButton } from "../../components/loading/withLoadingButton";
import { getCategories } from "../../services/categories/categoryService";
import { getBrands } from "../../services/brands/brandService";
import { populateSelect } from "../../utils/selectOptions";
import { showCrudState } from "../../components/crud-state/crudState";
import { renderPagination } from "../pagination/pagination";


export type ProductSelectedCallback = (product: Product) => void;

export { productSelectorHtml };

const pagination = createPaginationState<Product>();

export function initProductSelector(
    onSelect: ProductSelectedCallback,
): void {
    const modal = document.querySelector<HTMLDivElement>("#product-selector-modal");
    const closeButton = document.querySelector<HTMLButtonElement>("#product-selector-close");
    const cancelButton = document.querySelector<HTMLButtonElement>("#product-selector-cancel");
    const searchButton = document.querySelector<HTMLButtonElement>("#product-selector-search");

    if (!modal || !closeButton || !cancelButton || !searchButton) {
        throw new Error("No se pudo inicializar el selector de productos.");
    }

    const openModal = (): void => {
        modal.hidden = false;
        document.body.classList.add("modal-open");
    };

    const closeModal = (): void => {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
    };

    loadProductFormOptions();
    
    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    searchButton?.addEventListener("click", searchProducts);

    const searchInputs = document.querySelectorAll<HTMLInputElement>("input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchProducts();
            }
        });
    });


    // Permite seleccionar un producto desde la grilla.
    modal.addEventListener("click", (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }

        const productId = target.dataset.productId;
        if (!productId) {
            return;
        }
        console.log(productsFound)
        const product = productsFound.find(
            (item) => item.id === Number(productId),
        );

        if (!product) {
            return;
        }
        onSelect(product);
        closeModal();
    });

    modal.addEventListener("product-selector:open", openModal);
}

async function loadProductFormOptions(): Promise<void> {
    const categorySelectFilter = document.querySelector<HTMLSelectElement>("#product-selector-category");
    const brandSelectFilter = document.querySelector<HTMLSelectElement>("#product-selector-brand");


    if (!categorySelectFilter || !brandSelectFilter) {
        throw new Error("No se encontraron los select de categoría y marca.");
    }

    const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands(),
    ]);

    populateSelect(categorySelectFilter, categories, "Todas");
    populateSelect(brandSelectFilter, brands, "Todas");
}

let productsFound: Product[] = [];

async function searchProducts(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#product-selector-search");

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
    const codeInput = document.querySelector<HTMLInputElement>("#product-selector-code");
    const descriptionInput = document.querySelector<HTMLInputElement>("#product-selector-description");
    const brandSelect = document.querySelector<HTMLSelectElement>("#product-selector-brand");
    const categorySelect = document.querySelector<HTMLSelectElement>("#product-selector-category");
    const resultsBody = document.querySelector<HTMLTableSectionElement>("#product-selector-results");
    const errorMessage = document.querySelector<HTMLParagraphElement>("#product-selector-error");

    if (!codeInput || !descriptionInput || !brandSelect || !categorySelect || !resultsBody || !errorMessage) 
        throw new Error("No se encontraron los campos del selector.");
    
    const crudContainer = document.querySelector<HTMLElement>("#product-selector-results-container");
    if (!crudContainer) 
        return;
    

    const filter: ProductFilter = {
        code: codeInput?.value.trim() || undefined,
        description: descriptionInput?.value.trim() || undefined,
        barcode: "",
        categoryId: categorySelect?.value ? parseInt(categorySelect.value) : undefined,
        brandId: brandSelect?.value ? parseInt(brandSelect.value) : undefined,
        active: true
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
            const paginationContainer = document.querySelector<HTMLElement>("#product-selector-pagination");

            if (paginationContainer) {
                paginationContainer.replaceChildren();
            }
                showCrudState(crudContainer, "no-results");
                return;
        }

        pagination.items = products.items;
        pagination.totalPages = products.totalPages;
        pagination.totalItems = products.totalItems;
        productsFound = products.items;
        renderProductsPage();

        } catch (error) {
            alert("Error al buscar clientes: " + error);
    }
}


function renderProductsPage(): void {
    renderProductResults(pagination.items);
    const paginationContainer = document.querySelector<HTMLElement>(
        "#product-selector-pagination",
    );

    if (!paginationContainer) {
        console.error("No se encontró el contenedor de paginación del selector.");
        return;
    }

    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadProducts();
        },
    });

}


function renderProductResults(products: Product[]): void {
    const resultsBody = document.querySelector<HTMLTableSectionElement>("#product-selector-results");

    if (!resultsBody) {
        return;
    }

    resultsBody.replaceChildren();

    for (const product of products) {
        const row = document.createElement("tr");

        const codeCell = document.createElement("td");
        codeCell.textContent = product.code;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = product.description;

        const brandCell = document.createElement("td");
        brandCell.textContent = product.brandName;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = product.categoryName;

        const actionsCell = document.createElement("td");
        const selectButton = document.createElement("button");

        selectButton.type = "button";
        selectButton.className = "btn btn-primary";
        selectButton.textContent = "+";
        selectButton.dataset.productId = String(product.id);

        actionsCell.appendChild(selectButton);

        row.append(
            codeCell,
            descriptionCell,
            brandCell,
            categoryCell,
            actionsCell,
        );

        resultsBody.appendChild(row);
    }

}

/**
 * Abre el selector desde la pantalla que lo esté utilizando.
 */
export function openProductSelector(): void {
    const modal = document.querySelector<HTMLDivElement>(
        "#product-selector-modal",
    );

    if (!modal) {
        throw new Error("No se encontró el modal selector de productos.");
    }

    modal.dispatchEvent(new Event("product-selector:open"));
}
