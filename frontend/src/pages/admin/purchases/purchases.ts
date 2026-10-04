import purchasesHtml from "./purchases.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderPurchases(): void {
    renderLayout(purchasesHtml);
}