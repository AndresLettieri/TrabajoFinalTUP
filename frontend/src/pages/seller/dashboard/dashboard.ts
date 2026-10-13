import dashboardHtml from "./dashboard.html?raw";
import { renderLayout } from "../../shared/layout";
import { getSellerDashboard, type SellerDashboard } from "../../../services/dashboards/dashboardService";
import { getCurrentUser } from "../../../services/auth/authSession";
import { formatCurrency } from "../../../utils/formatsUtils";

export async function renderSellerDashboard(): Promise<void> {
    renderLayout(dashboardHtml);

    const salesToday = document.querySelector<HTMLElement>("#sales-today");
    const incomeToday = document.querySelector<HTMLElement>("#income-today");
    const salesPeriod = document.querySelector<HTMLElement>("#sales-period");
    const incomePeriod = document.querySelector<HTMLElement>("#income-period");
    const customersToday = document.querySelector<HTMLElement>("#customers-today");
    const stockAlerts = document.querySelector<HTMLElement>("#stock-alerts");


    try {
        const currentUser = getCurrentUser();
        const dashboard: SellerDashboard = await getSellerDashboard({ userId: currentUser!.id });
        salesToday!.textContent = String(dashboard.salesTodayCount);
        incomeToday!.textContent = formatCurrency(dashboard.salesTodayAmount);
        salesPeriod!.textContent = String(dashboard.salesInPeriodCount);
        incomePeriod!.textContent = formatCurrency(dashboard.salesInPeriodCount);
        customersToday!.textContent = String(dashboard.customersTodayCount);

    } catch (error) {
        console.error("Error al cargar el dashboard:", error);

        stockAlerts!.innerHTML = `
        <p class="form-error">
            No se pudieron cargar los datos del dashboard.
        </p>
        `;
    }
}





