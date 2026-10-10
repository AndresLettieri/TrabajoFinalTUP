import dashboardHtml from "./dashboard.html?raw";
import { renderLayout } from "../../shared/layout";
import { getAdminDashboard, type Dashboard } from "../../../services/dashboards/dashboardService";
import type { Product } from "../../../services/products/productsService";
import { getCurrentUser } from "../../../services/auth/authSession";
import { formatCurrency } from "../../../utils/formatsUtils";

export async function renderAdminDashboard(): Promise<void> {
    renderLayout(dashboardHtml);

    const salesToday = document.querySelector<HTMLElement>("#sales-today");
    const purchasesToday = document.querySelector<HTMLElement>("#purchases-today");
    const incomePeriod = document.querySelector<HTMLElement>("#income-period");
    const estimatedProfit = document.querySelector<HTMLElement>("#estimated-profit");
    const stockAlerts = document.querySelector<HTMLElement>("#stock-alerts");


    try {
        const currentUser = getCurrentUser();
        const dashboard: Dashboard = await getAdminDashboard({ userId: currentUser!.id });
        salesToday!.textContent = formatCurrency(dashboard.salesTodayAmount);
        purchasesToday!.textContent = formatCurrency(dashboard.purchasesTodayAmount);
        incomePeriod!.textContent = formatCurrency(dashboard.periodRevenue);
        estimatedProfit!.textContent = formatCurrency(dashboard.estimatedProfit);

        renderStockAlerts(stockAlerts!, dashboard.lowStockProducts);
    } catch (error) {
        console.error("Error al cargar el dashboard:", error);

        stockAlerts!.innerHTML = `
        <p class="form-error">
            No se pudieron cargar los datos del dashboard.
        </p>
        `;
    }
}


function renderStockAlerts(container: HTMLElement,products: Product[]): void {
    if (products.length === 0) {
        container.innerHTML = "<p>No hay productos con stock bajo.</p>";
        return;
    }

    container.innerHTML = products
        .map(
            (product) => `
                <article class="dashboard-stock-item">
                <div class="dashboard-stock-info">
                    <strong class="dashboard-stock-name">
                    ${product.description}
                    </strong>
                    <span class="dashboard-stock-label">Stock por debajo del mínimo</span>
                </div>

                <div class="dashboard-stock-details">
                    <div class="dashboard-stock-value">
                    <span>Stock actual</span>
                    <strong>${product.stock}</strong>
                    </div>

                    <div class="dashboard-stock-value">
                    <span>Stock mínimo</span>
                    <strong>${product.minimumStock}</strong>
                    </div>
                </div>
                </article>
             `
        )
    .join("");
}



