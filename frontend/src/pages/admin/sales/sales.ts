import salesHtml from "./sales.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderSales(): void {
    renderLayout(salesHtml);
}