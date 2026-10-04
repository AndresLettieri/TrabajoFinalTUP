import customersHtml from "./customers.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderCustomers(): void {
    renderLayout(customersHtml);
}