import saleDetailHtml from "./saleDetail.html?raw";

import { renderLayout } from "../../shared/layout";
import { getOrderById } from "../../../services/orders/orderService";
import { formatCurrency } from "../../../utils/formatsUtils";
import { getCurrentUser } from "../../../services/auth/authSession";
import { navigate } from "../../../router/router";

const currentUser = getCurrentUser();
    
export function renderSaleDetail(): void {
    renderLayout(saleDetailHtml);

    const pathParts = window.location.pathname.split("/");
    const saleIdText = pathParts[pathParts.length - 1];
    const saleId = Number(saleIdText);

    const backButton =
        document.querySelector<HTMLButtonElement>("#back-to-sales");

    backButton?.addEventListener("click", () => {
        if (currentUser?.role !== "Admin") {
            navigate("/seller/sales");
        } else {
            navigate("/admin/sales");
        }
    });

    if (!Number.isInteger(saleId) || saleId <= 0) {
        showError("El identificador de la venta no es válido.");
        return;
    }

    loadSaleDetail(saleId);
}

async function loadSaleDetail(id: number): Promise<void> {
    const subtitle = document.querySelector<HTMLParagraphElement>("#sale-detail-subtitle");

    if (subtitle) 
        subtitle.textContent = "Cargando información de la compra...";

    try {
        const sale = await getOrderById(id);

        setText("#sale-detail-number", String(sale.number));
        setText("#sale-detail-date", formatDate(sale.date));
        setText("#sale-detail-vendor", sale.sellerName);
        setText("#sale-detail-customer", sale.customerName);

        const statusText = sale.cancelled ? "Cancelada" : "Registrada";

        setText("#sale-detail-status", statusText);

        const statusBadge = document.querySelector<HTMLSpanElement>(
            "#sale-detail-status-badge"
        );

        if (statusBadge) {
            statusBadge.textContent = statusText;
            statusBadge.classList.toggle("cancelled", sale.cancelled);
        }

        setText("#sale-detail-total", formatCurrency(sale.total));

        if (subtitle) {
            subtitle.textContent = `Detalle del comprobante de venta N.º ${sale.number}`;
        }

        renderSaleItems(sale.details);
    } catch (error) {
        console.error("Error al cargar el detalle de la compra:", error);
        showError("No se pudo cargar la compra. Intentá nuevamente.");
        
        if (subtitle) {
            subtitle.textContent = "No se pudo cargar la información de la compra.";
        }
    }
}

function renderSaleItems(
    details: {
        productId: number;
        productCode: string;
        productDescription: string;
        quantity: number;
        salePrice: number;
        subtotal: number;
    }[]
): void {
    const tbody = document.querySelector<HTMLTableSectionElement>(
        "#sale-detail-items"
    );

    if (!tbody) {
        return;
    }

    tbody.replaceChildren();

    if (details.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = "La venta no tiene productos registrados.";

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
        priceCell.textContent = formatCurrency(detail.salePrice);

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
        "#sale-detail-error"
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
