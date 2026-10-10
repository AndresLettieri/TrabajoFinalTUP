import purchaseDetailHtml from "./purchaseDetail.html?raw";

import { renderLayout } from "../../shared/layout";
import { getPurchaseById } from "../../../services/purchases/purchaseService";
import { formatCurrency } from "../../../utils/formatsUtils";

export function renderPurchaseDetail(): void {
    renderLayout(purchaseDetailHtml);

    const pathParts = window.location.pathname.split("/");
    const purchaseIdText = pathParts[pathParts.length - 1];
    const purchaseId = Number(purchaseIdText);

    const backButton =
        document.querySelector<HTMLButtonElement>("#back-to-purchases");

    backButton?.addEventListener("click", () => {
        window.history.pushState({}, "", "/admin/purchases");
        window.dispatchEvent(new PopStateEvent("popstate"));
    });

    if (!Number.isInteger(purchaseId) || purchaseId <= 0) {
        showError("El identificador de la compra no es válido.");
        return;
    }

    loadPurchaseDetail(purchaseId);
}

async function loadPurchaseDetail(id: number): Promise<void> {
    const subtitle = document.querySelector<HTMLParagraphElement>(
        "#purchase-detail-subtitle"
    );

    if (subtitle) {
        subtitle.textContent = "Cargando información de la compra...";
    }

    try {
        const purchase = await getPurchaseById(id);

        setText("#purchase-detail-number", String(purchase.number));
        setText("#purchase-detail-date", formatDate(purchase.date));
        setText("#purchase-detail-vendor", purchase.vendorName);
        setText(
            "#purchase-detail-observations",
            purchase.observations?.trim() || "Sin observaciones"
        );

        const statusText = purchase.cancelled ? "Cancelada" : "Registrada";

        setText("#purchase-detail-status", statusText);

        const statusBadge = document.querySelector<HTMLSpanElement>(
            "#purchase-detail-status-badge"
        );

        if (statusBadge) {
            statusBadge.textContent = statusText;
            statusBadge.classList.toggle("cancelled", purchase.cancelled);
        }

        setText("#purchase-detail-total", formatCurrency(purchase.total));

        if (subtitle) {
            subtitle.textContent = `Detalle del comprobante de compra N.º ${purchase.number}`;
        }

        renderPurchaseItems(purchase.details);
    } catch (error) {
        console.error("Error al cargar el detalle de la compra:", error);
        showError("No se pudo cargar la compra. Intentá nuevamente.");
        
        if (subtitle) {
            subtitle.textContent = "No se pudo cargar la información de la compra.";
        }
    }
}

function renderPurchaseItems(
    details: {
        productId: number;
        productCode: string;
        productDescription: string;
        quantity: number;
        purchasePrice: number;
        subtotal: number;
    }[]
): void {
    const tbody = document.querySelector<HTMLTableSectionElement>(
        "#purchase-detail-items"
    );

    if (!tbody) {
        return;
    }

    tbody.replaceChildren();

    if (details.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "La compra no tiene productos registrados.";

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    details.forEach((detail) => {
        const row = document.createElement("tr");

        const codeCell = document.createElement("td");
        codeCell.textContent = detail.productCode;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = detail.productDescription;

        const quantityCell = document.createElement("td");
        quantityCell.textContent = String(detail.quantity);

        const priceCell = document.createElement("td");
        priceCell.textContent = formatCurrency(detail.purchasePrice);

        const subtotalCell = document.createElement("td");
        subtotalCell.textContent = formatCurrency(detail.subtotal);

        row.append(
            codeCell,
            descriptionCell,
            quantityCell,
            priceCell,
            subtotalCell
        );

        tbody.appendChild(row);
    });
}

function setText(selector: string, value: string): void {
    const element = document.querySelector<HTMLElement>(selector);

    if (element) {
        element.textContent = value;
    }
}

function showError(message: string): void {
    const errorElement = document.querySelector<HTMLParagraphElement>(
        "#purchase-detail-error"
    );

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-AR");
}
