import categoriesHtml from "./categories.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderCategories(): void {
    renderLayout(categoriesHtml);
}