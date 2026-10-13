import saleHtml from "./newSale.html?raw";
import { renderLayout } from "../layout";
import { formatCurrency } from "../../../utils/formatsUtils";
import { productSelectorHtml, initProductSelector, openProductSelector} from "../../../components/productSelector/productSelector";
import type { Product } from "../../../services/products/productsService";
import { getCustomers, type Customer } from "../../../services/customers/customerService";
import { getPaymentMethods, type PaymentMethod } from "../../../services/paymentMethods/paymentMethodService";
import { initCustomerSearch } from "../../../components/customerSearch/customerSearch";
import { getCurrentUser } from "../../../services/auth/authSession";
import { getUser, type User } from "../../../services/users/userService";
import { createOrder, type CreateOrderRequest } from "../../../services/orders/orderService";
import { navigate } from "../../../router/router";

interface SalesProduct {
    product: Product;
    quantity: number;
}


const currentUser = getCurrentUser();
let selectedProducts: SalesProduct[] = [];
let customers: Customer[] = [];
let paymentMethods: PaymentMethod[] = [];
let users: User[] = [];

export async function renderNewSale(): Promise<void> {
    console.log("Rendering new sale page");
    renderLayout(saleHtml);

    selectedProducts = [];

    if (!document.querySelector("#product-selector-modal")) {
        document.body.insertAdjacentHTML(
            "beforeend",
            productSelectorHtml,
        );
    }

    await initializeSalesForm();

    initializeProductSelector();
    initializeSalesEvents();
    renderSalesProducts();
}

async function loadSalesSellers(): Promise<void> {
    const container = document.querySelector<HTMLDivElement>("#sales-seller-container");
    const select = document.querySelector<HTMLSelectElement>("#sales-seller");

    if (!container || !select) 
        throw new Error("No se encontró el selector de vendedor.");
    



    if (!currentUser) 
        throw new Error("No se encontró el usuario de la sesión.");
    

    if (currentUser.role === "Seller") {
        select.add(new Option(currentUser.name, String(currentUser.id)));
        select.value = String(currentUser.id);
        select.disabled = true;
        return;
    }

    container.hidden = false;
    users = await getUser();

    const sellers = users.filter(user => user.role === "Seller");

    for (const seller of sellers) {
        select.add(new Option(seller.name, String(seller.id)));
    }

    if (currentUser.role === "Admin") 
        select.value = "";
    
}


function initializeProductSelector(): void {
    initProductSelector(addProduct);
}

function initializeSalesEvents(): void {
    const addProductButton = document.querySelector<HTMLButtonElement>("#sales-add-product");

    if (!addProductButton) 
        throw new Error("No se encontró el botón para agregar productos.");
    
    addProductButton.addEventListener("click", openProductSelector);

    const confirmButton = document.querySelector<HTMLButtonElement>("#sales-confirm");

    if (!confirmButton) 
        throw new Error("No se encontró el botón para confirmar la venta.");
    
    confirmButton.addEventListener("click", () => {
        void confirmSale();
    });

    const backButton = document.querySelector<HTMLButtonElement>("#sales-cancel");
    if (backButton) 
        backButton.addEventListener("click", () => {
            if (currentUser?.role !== "Admin") {
                navigate("/seller/sales");
            } else {
                navigate("/admin/sales");
            }
        });


}

function addProduct(product: Product): void {
    const existingProduct = selectedProducts.find(
        (item) => item.product.id === product.id,
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        selectedProducts.push({
            product,
            quantity: 1,
        });
    }

    renderSalesProducts();
}

async function initializeSalesForm(): Promise<void> {
    await Promise.all([
        loadSalesCustomers(),
        loadPaymentMethods(),
        loadSalesSellers(),
    ]);
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

async function loadPaymentMethods(): Promise<void> {
    const select = document.querySelector<HTMLSelectElement>("#sales-payment-method");

    if (!select) 
        throw new Error("No se encontró el selector de métodos de pago.");
    
    paymentMethods = await getPaymentMethods();

    select.replaceChildren(new Option("Seleccioná un método de pago", ""));

    for (const method of paymentMethods) {
        select.add(new Option(method.name, String(method.id)));
    }
}


function renderSalesProducts(): void {
    const productsBody = document.querySelector<HTMLTableSectionElement>("#sales-products");
    const totalElement = document.querySelector<HTMLElement>("#sales-total");
    const errorMessage = document.querySelector<HTMLParagraphElement>("#sales-products-error");

    if (!productsBody || !totalElement || !errorMessage) 
        throw new Error("No se encontraron los elementos de la grilla de ventas.");
    

    productsBody.replaceChildren();
    errorMessage.textContent = "";

    if (selectedProducts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "Todavía no agregaste productos a la venta.";

        row.appendChild(cell);
        productsBody.appendChild(row);

        totalElement.textContent = formatCurrency(0);
        return;
    }

    for (const item of selectedProducts) {
        const { product, quantity } = item;

        const row = document.createElement("tr");

        const codeCell = document.createElement("td");
        codeCell.textContent = product.code;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = product.description;

        const quantityCell = document.createElement("td");
        const quantityInput = document.createElement("input");

        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.step = "1";
        quantityInput.value = String(quantity);
        quantityInput.dataset.productId = String(product.id);
        quantityInput.setAttribute("aria-label", `Cantidad de ${product.description}`);

        quantityCell.appendChild(quantityInput);

        const priceCell = document.createElement("td");
        priceCell.textContent = formatCurrency(product.salePrice);

        const subtotalCell = document.createElement("td");
        subtotalCell.textContent = formatCurrency(
            product.salePrice * quantity,
        );

        const actionsCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "btn btn-secondary";
        removeButton.textContent = "Quitar";
        removeButton.dataset.removeProductId = String(product.id);

        actionsCell.appendChild(removeButton);

        row.append(
            codeCell,
            descriptionCell,
            quantityCell,
            priceCell,
            subtotalCell,
            actionsCell,
        );

        productsBody.appendChild(row);
    }

    totalElement.textContent = formatCurrency(
        selectedProducts.reduce(
            (total, item) =>
                total + item.product.salePrice * item.quantity,
            0,
        ),
    );
    
    initializeProductGridEvents();
}

function initializeProductGridEvents(): void {
    const productsBody = document.querySelector<HTMLTableSectionElement>("#sales-products");

    if (!productsBody) 
        return;
    

    // Evita registrar los mismos eventos cada vez que se renderiza la grilla.
    productsBody.onchange = (event: Event): void => {
        const target = event.target;

        if (!(target instanceof HTMLInputElement)) 
            return;
        

        const productId = Number(target.dataset.productId);

        if (!productId) 
            return;
    
        const item = selectedProducts.find((product) => product.product.id === productId,);

        if (!item) 
            return;

        const quantity = Number(target.value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            target.value = String(item.quantity);
            return;
        }

        if (quantity > item.product.stock) {
            alert(
                `Stock insuficiente para ${item.product.description}. ` +
                `Stock disponible: ${item.product.stock}.`
            );

            target.value = String(item.quantity);
            return;
        }

        item.quantity = quantity;
        renderSalesProducts();
    };

    productsBody.onclick = (event: MouseEvent): void => {
        const target = event.target;

        if (!(target instanceof HTMLElement)) 
            return;

        const button = target.closest<HTMLButtonElement>("[data-remove-product-id]");

        if (!button) 
            return;

        const productId = Number(button.dataset.removeProductId);

        selectedProducts = selectedProducts.filter((item) => item.product.id !== productId);

        renderSalesProducts();
    };
}

function validateProductsStock(): string | null {
    for (const item of selectedProducts) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) 
            return `La cantidad de ${item.product.description} debe ser un entero positivo.`;
        

        if (item.quantity > item.product.stock) {
            return (
                `Stock insuficiente para ${item.product.description}. ` +
                `Disponible: ${item.product.stock}.`
            );
        }
    }

    return null;
}

async function confirmSale(): Promise<void> {
    const customerIdInput = document.querySelector<HTMLInputElement>("#sales-customer-id");
    const paymentMethodSelect = document.querySelector<HTMLSelectElement>("#sales-payment-method");
    const sellerSelect = document.querySelector<HTMLSelectElement>("#sales-seller");
    const productsError = document.querySelector<HTMLParagraphElement>("#sales-products-error");
    const confirmButton = document.querySelector<HTMLButtonElement>("#sales-confirm");

    if (!customerIdInput || !paymentMethodSelect || !productsError || !confirmButton) 
        throw new Error("No se pudo inicializar la confirmación de venta.");
    

    productsError.textContent = "";

    const customerId = Number(customerIdInput.value);
    const paymentMethodId = Number(paymentMethodSelect.value);

    if (!currentUser) {
        alert("No se encontró el usuario de la sesión.");
        return;
    }

    if (!customerId) {
        alert("Seleccioná un cliente.");
        return;
    }

    if (!paymentMethodId) {
        alert("Seleccioná un método de pago.");
        return;
    }

    let sellerId = currentUser.id;

    if (currentUser.role === "Admin") {
        if (!sellerSelect || !sellerSelect.value) {
            alert("Seleccioná el usuario al que se atribuirá la venta.");
            return;
        }

        sellerId = Number(sellerSelect.value);
    }

    if (selectedProducts.length === 0) {
        productsError.textContent = "Agregá al menos un producto a la venta.";
        return;
    }

    const stockError = validateProductsStock();

    if (stockError) {
        productsError.textContent = stockError;
        return;
    }

    const request: CreateOrderRequest = {
        customerId,
        sellerId,
        paymentMethodId,
        date: new Date().toISOString(),
        details: selectedProducts.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
        })),
    };

    confirmButton.disabled = true;
    confirmButton.textContent = "Registrando...";

    try {
        await createOrder(request);
        selectedProducts = [];
        customerIdInput.value = "";
        const customerSearch = document.querySelector<HTMLInputElement>("#sales-customer-search");
        const customerResults = document.querySelector<HTMLDivElement>("#sales-customer-results");
        const customerSelected = document.querySelector<HTMLParagraphElement>("#sales-customer-selected");

        if (customerSearch) customerSearch.value = "";
        if (customerResults) customerResults.replaceChildren();
        if (customerResults) customerResults.hidden = true;
        
        if (customerSelected) {
            customerSelected.textContent = "";
            customerSelected.hidden = true;
        }

        paymentMethodSelect.value = "";

        renderSalesProducts();
        alert("La venta se registró correctamente.");
    
    } 
    catch (error) {
        console.error("Error al registrar la venta:", error);
        alert("No se pudo registrar la venta. Verificá el stock y los datos e intentá nuevamente.");
    } 
    finally {
        confirmButton.disabled = false;
        confirmButton.textContent = "Confirmar venta";
    }
}
