import vendorsHtml from "./vendors.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderVendors(): void {
    renderLayout(vendorsHtml);
}