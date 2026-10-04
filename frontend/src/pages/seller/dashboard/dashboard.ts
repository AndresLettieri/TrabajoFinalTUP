import dashboardHtml from "./dashboard.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderSellerDashboard(): void {
  renderLayout(dashboardHtml);
}