import customersHtml from "./customers.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderSellerCustomers(): void {
    renderLayout(customersHtml);
}