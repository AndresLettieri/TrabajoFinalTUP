import { getCustomers } from "../../services/customers/customerService";
import type { Customer } from "../../services/customers/customerService";

interface CustomerSearchOptions {
    input: HTMLInputElement;
    hiddenInput: HTMLInputElement;
    results: HTMLDivElement;
    selectedMessage: HTMLParagraphElement;
    customers: Customer[];
    onSelect: (customer: Customer) => void;
}

function normalizeSearchText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export async function initCustomerSearch(
    options: CustomerSearchOptions,
): Promise<void> {
    const {input, hiddenInput, results, selectedMessage, customers, onSelect} = options;


    input.addEventListener("input", () => {
        const searchText = normalizeSearchText(input.value);

        hiddenInput.value = "";
        selectedMessage.hidden = true;
        results.innerHTML = "";

        if (!searchText) {
            results.hidden = true;
            return;
        }

        const matches = customers
            .filter((customer) =>
                normalizeSearchText(customer.name).includes(searchText),
            )
            .slice(0, 20);

        if (matches.length === 0) {
            results.innerHTML =
                `<p class="report-customer-empty">No se encontraron clientes.</p>`;
            results.hidden = false;
            return;
        }

        results.innerHTML = matches
            .map((customer) => `
                <button
                    type="button"
                    class="report-customer-option"
                    data-customer-id="${customer.id}"
                >
                    ${customer.name}
                </button>
            `)
            .join("");

        results.hidden = false;
    });

    results.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const button = target.closest<HTMLButtonElement>(
            "[data-customer-id]",
        );

        if (!button) return;

        const customerId = button.dataset.customerId;
        if (!customerId) return;

        const customer = customers.find(
            (item) => String(item.id) === customerId,
        );

        if (!customer) return;

        hiddenInput.value = String(customer.id);
        input.value = customer.name;

        selectedMessage.textContent =
            `Cliente seleccionado: ${customer.name}`;
        selectedMessage.hidden = false;
        results.hidden = true;

        onSelect(customer);
    });
}