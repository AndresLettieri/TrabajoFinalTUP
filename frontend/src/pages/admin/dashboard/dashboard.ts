import dashboardHtml from "./dashboard.html?raw";
import { renderLayout } from "../../shared/layout";

import { getPurchases } from "../../../services/purchases/purchaseService";

export async function renderAdminDashboard(): Promise<void> {
    renderLayout(dashboardHtml);
    await loadPurchasesSummary();
}

async function loadPurchasesSummary(): Promise<void> {
    const purchasesCard = document.querySelector<HTMLElement>("#purchases-today");

    if (!purchasesCard) return;

    try {
        const purchases = await getPurchases();
        const today = new Date().toISOString().split("T")[0];
        const total = purchases.filter((purchase) => {
            return (!purchase.cancelled && purchase.date.startsWith(today));
        }).reduce((sum, purchase) => sum + purchase.total, 0);

        purchasesCard.textContent = "$" + total;
    } catch (error) {
        console.error("Error al cargar las compras:", error);
        purchasesCard.textContent = "$0";
    }
}
