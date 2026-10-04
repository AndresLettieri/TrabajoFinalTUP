import reportsHtml from "./reports.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderReports(): void {
    renderLayout(reportsHtml);
}