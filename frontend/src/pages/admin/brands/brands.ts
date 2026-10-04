import brandsHtml from "./brands.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderBrands(): void {
    renderLayout(brandsHtml);
}