import productsHtml from "./products.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderProducts(): void {
    renderLayout(productsHtml);
}