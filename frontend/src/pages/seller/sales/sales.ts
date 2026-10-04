import salesHtml from "./sales.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderSellerSales(): void {
    renderLayout(salesHtml);
}