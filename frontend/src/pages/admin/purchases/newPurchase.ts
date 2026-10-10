import newPurchaseHtml from "./newPurchase.html?raw";
import { renderLayout } from "../../shared/layout";
import { getVendors } from "../../../services/vendors/vendorService";
import { populateSelect } from "../../../utils/selectOptions";
import { initProductSelector, openProductSelector, productSelectorHtml, } from "../../../components/productSelector/productSelector";
import type { Product } from "../../../services/products/productsService";
import { formatCurrency } from "../../../utils/formatsUtils";
import { createPurchase, type CreatePurchaseRequest } from "../../../services/purchases/purchaseService";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { navigate } from "../../../router/router";

interface PurchaseDetailRow {
    product: Product;
    quantity: number;
    purchasePrice: number;
}

let purchaseDetails: PurchaseDetailRow[] = [];

export function renderNewPurchase(): void {
    purchaseDetails = [];
    renderLayout(newPurchaseHtml + productSelectorHtml);

    const dateInput = document.querySelector<HTMLInputElement>("#purchase-date");

    if (dateInput) 
        dateInput.value = new Date().toISOString().split("T")[0];
    

    loadPurchaseFormOptions();
    
    initProductSelector((product: Product) => {
         addProductToPurchase(product);
    });

    const addProductButton = document.querySelector<HTMLButtonElement>("#add-purchase-product",);

    if (addProductButton) 
        addProductButton.addEventListener("click", openProductSelector);

    
    const purchaseForm = document.querySelector<HTMLFormElement>("#purchase-form");

    if (purchaseForm) {
        purchaseForm.addEventListener("submit", async (event: SubmitEvent) => {
            event.preventDefault();
            await savePurchase();
        });
    }

    const backButton = document.querySelector<HTMLButtonElement>("#cancel-purchase-form");
    if (backButton) 
        backButton.addEventListener("click", () => {
            navigate("/admin/purchases");
        });

}


async function loadPurchaseFormOptions(): Promise<void> {
    const vendorSelect = document.querySelector<HTMLSelectElement>("#purchase-vendor");
    try {
        const vendors = await getVendors();
        populateSelect(vendorSelect!, vendors, "Seleccioná un proveedor");
    } catch (error) {
        console.error("Error al cargar las opciones de la compra:", error);
        throw error;
    }
}

function addProductToPurchase(product: Product): void {
    const errorMessage = document.querySelector<HTMLParagraphElement>("#purchase-details-error",);

    if (!errorMessage) 
        return;

    errorMessage.textContent = "";

    const existingProduct = purchaseDetails.find((detail) => detail.product.id === product.id,);

    if (existingProduct) {
        errorMessage.textContent = "Ese producto ya está agregado a la compra.";
        return;
    }

    purchaseDetails.push({
        product,
        quantity: 1,
        purchasePrice: product.purchasePrice,
    });

    renderPurchaseDetails();
}

function renderPurchaseDetails(): void {
    const detailsBody = document.querySelector<HTMLTableSectionElement>("#purchase-details");
    const totalElement = document.querySelector<HTMLElement>("#purchase-total");

    if (!detailsBody || !totalElement) 
        return;
    
    detailsBody.replaceChildren();

    for (const detail of purchaseDetails) {
        const row = document.createElement("tr");

        const codeCell = document.createElement("td");
        codeCell.textContent = detail.product.code;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = detail.product.description;

        const quantityCell = document.createElement("td");
        const quantityInput = document.createElement("input");

        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.step = "1";
        quantityInput.value = String(detail.quantity);
        quantityInput.setAttribute(
            "aria-label",
            `Cantidad de ${detail.product.description}`,
        );

        quantityInput.addEventListener("change", () => {
            const quantity = Number(quantityInput.value);

            if (!Number.isInteger(quantity) || quantity < 1) {
                quantityInput.value = String(detail.quantity);
                return;
            }

            detail.quantity = quantity;
            renderPurchaseDetails();
        });

        quantityCell.appendChild(quantityInput);

        const priceCell = document.createElement("td");
        const priceInput = document.createElement("input");

        priceInput.type = "number";
        priceInput.min = "0";
        priceInput.step = "0.01";
        priceInput.value = String(detail.purchasePrice);
        priceInput.setAttribute(
            "aria-label",
            `Precio de compra de ${detail.product.description}`,
        );

        priceInput.addEventListener("change", () => {
            const price = Number(priceInput.value);

            if (!Number.isFinite(price) || price < 0) {
                priceInput.value = String(detail.purchasePrice);
                return;
            }

            detail.purchasePrice = price;
            renderPurchaseDetails();
        });

        priceCell.appendChild(priceInput);

        const subtotalCell = document.createElement("td");
        subtotalCell.textContent = formatCurrency(
            detail.quantity * detail.purchasePrice,
        );

        const actionsCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "btn btn-secondary";
        removeButton.textContent = "Quitar";
        removeButton.addEventListener("click", () => {
            purchaseDetails = purchaseDetails.filter(
                (item) => item.product.id !== detail.product.id,
            );

            renderPurchaseDetails();
        });

        actionsCell.appendChild(removeButton);

        row.append(
            codeCell,
            descriptionCell,
            quantityCell,
            priceCell,
            subtotalCell,
            actionsCell,
        );

        detailsBody.appendChild(row);
    }

    const total = purchaseDetails.reduce(
        (sum, detail) => sum + detail.quantity * detail.purchasePrice,
        0,
    );

    totalElement.textContent = formatCurrency(total);
}


async function savePurchase(): Promise<void> {
    const vendorSelect = document.querySelector<HTMLSelectElement>("#purchase-vendor");
    const numberInput = document.querySelector<HTMLInputElement>("#purchase-number");
    const dateInput = document.querySelector<HTMLInputElement>("#purchase-date");
    const observationsInput = document.querySelector<HTMLTextAreaElement>("#purchase-observations");
    const errorMessage = document.querySelector<HTMLParagraphElement>("#purchase-error");
    const saveButton = document.querySelector<HTMLButtonElement>("#save-purchase-button");

    if (!vendorSelect || !numberInput || !dateInput || !observationsInput || !errorMessage ||!saveButton) {
        console.error("No se encontraron todos los campos del formulario.");
        return;
    }

    errorMessage.textContent = "";

    const number = Number(numberInput.value);

    if (!Number.isInteger(number) || number < 1) {
        errorMessage.textContent =
            "Ingresá un número de comprobante válido.";
        return;
    }

    if (new Date(dateInput.value).getTime() > Date.now()) {
        errorMessage.textContent = "La fecha de la compra no puede ser futura.";
        return;
    }

    if (purchaseDetails.length === 0) {
        errorMessage.textContent = "Agregá al menos un producto a la compra.";
        return;
    }

    const invalidDetail = purchaseDetails.some(
        (detail) =>
            !Number.isInteger(detail.quantity) ||
            detail.quantity < 1 ||
            !Number.isFinite(detail.purchasePrice) ||
            detail.purchasePrice < 0,
    );

    if (invalidDetail) {
        errorMessage.textContent = "Revisá las cantidades y los precios de los productos.";
        return;
    }

    const request: CreatePurchaseRequest = {
        vendorId: Number(vendorSelect.value),
        number,
        date: new Date(`${dateInput.value}T12:00:00`).toISOString(),
        observations: observationsInput.value.trim() || undefined,
        details: purchaseDetails.map((detail) => ({
            productId: detail.product.id,
            quantity: detail.quantity,
            purchasePrice: detail.purchasePrice,
        })),
    };

    try {
        await withLoadingButton(
            saveButton,
            async () => {
                await createPurchase(request);

                errorMessage.textContent = "";
                alert("La compra se registró correctamente.");
                navigate("/admin/purchases");
            },
            "Guardando...",
        );
    } catch (error) {
        const message = error instanceof Error
        ? "Error: " + error.message
        : "No se pudo crear la compra. Intentá nuevamente.";

        console.error("Error al crear la compra:",error);
        alert(message);
    }
}



