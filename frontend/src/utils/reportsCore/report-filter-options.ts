import { getVendors } from "../../services/vendors/vendorService";
import { getUser } from "../../services/users/userService";
import {getCustomers,type Customer} from "../../services/customers/customerService";
import { populateSelect } from "../../utils/selectOptions";
import { initCustomerSearch } from "../../components/customerSearch/customerSearch";
import { getCurrentUser } from "../../services/auth/authSession";
import type { ReportFilterType } from "./report.types";

let customers: Customer[] = [];
let customerSearchInitialized = false;

export async function loadReportFilterOptions(filters: ReportFilterType[],): Promise<void> {
    if (filters.includes("vendor")) 
        await loadVendors();
    
    if (filters.includes("seller")) 
        await loadSellers();
    
    if (filters.includes("customer")) 
        await loadCustomers();
    
}

async function loadVendors(): Promise<void> {
    const select = document.querySelector<HTMLSelectElement>("#report-vendor",);

    if (!select || select.length > 1) 
        return;

    const vendors = await getVendors();

    populateSelect(select, vendors, "Todos los proveedores");
}

async function loadSellers(): Promise<void> {
    const select = document.querySelector<HTMLSelectElement>("#report-seller");

    if (!select || select.length > 1) 
        return;

    const currentUser = getCurrentUser()!;

    if (currentUser.role === "Seller") {
        select.add(new Option(currentUser.name, String(currentUser.id)));
        select.value = String(currentUser.id);
        select.disabled = true;
        return;
    }
    
    const sellers = (await getUser()).filter(
        (user) => user.role === "Seller",
    );

    populateSelect(select, sellers, "Seleccioná un vendedor");
}

async function loadCustomers(): Promise<void> {
    if (customerSearchInitialized)
        return;
    
    const input = document.querySelector<HTMLInputElement>("#report-customer-search");
    const hiddenInput = document.querySelector<HTMLInputElement>("#report-customer-id");
    const results = document.querySelector<HTMLDivElement>("#report-customer-results");
    const selectedMessage = document.querySelector<HTMLParagraphElement>("#report-customer-selected");

    if (!input || !hiddenInput || !results || !selectedMessage) 
        throw new Error("No se pudo inicializar el filtro de clientes.",);
    
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

    customerSearchInitialized = true;
}