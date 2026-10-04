import layoutHtml from "./layout.html?raw";

import type { User } from "../../types/user";
import { getCurrentUser, logout } from "../../services/auth/authSession";
import { navigate } from "../../router/router";

export function renderLayout(content: string): void {
    const app = document.querySelector<HTMLDivElement>("#app");

    if (!app) {
        throw new Error("No se encontró el contenedor principal.");
    }

    app.innerHTML = layoutHtml;

    const user = getCurrentUser();

    if (!user) {
        navigate("/login");
        return;
    }

    setUserInfo(user);
    setSidebarMenu(user);
    setPageContent(content);
    setupNavigation();
    setupLogout();
    setupMobileMenu();
}

function setUserInfo(user: User): void {
    const userName = document.querySelector<HTMLSpanElement>("#user-name");
    const userRole = document.querySelector<HTMLSpanElement>("#user-role");

    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
}

function setSidebarMenu(user: User): void {
    const sidebarMenu = document.querySelector<HTMLUListElement>("#sidebar-menu");

    if (!sidebarMenu) return;

    if (user.role === "Admin") {
        sidebarMenu.innerHTML = `
        <li>
            <a href="/admin/dashboard" data-link>
            <span class="sidebar-icon">📊</span>
            <span>Dashboard</span>
            </a>
        </li>

        <li>
            <a href="/admin/products" data-link>
            <span class="sidebar-icon">📦</span>
            <span>Productos</span>
            </a>
        </li>

        <li>
            <a href="/admin/categories" data-link>
            <span class="sidebar-icon">🔖</span>
            <span>Categorías</span>
            </a>
        </li>

        <li>
            <a href="/admin/brands" data-link>
            <span class="sidebar-icon">🏷️</span>
            <span>Marcas</span>
            </a>
        </li>

        <li>
            <a href="/admin/customers" data-link>
            <span class="sidebar-icon">👥</span>
            <span>Clientes</span>
            </a>
        </li>

        <li>
            <a href="/admin/vendors" data-link>
            <span class="sidebar-icon">🚚</span>
            <span>Proveedores</span>
            </a>
        </li>

        <li>
            <a href="/admin/purchases" data-link>
            <span class="sidebar-icon">🛒</span>
            <span>Compras</span>
            </a>
        </li>

        <li>
            <a href="/admin/sales" data-link>
            <span class="sidebar-icon">💰</span>
            <span>Ventas</span>
            </a>
        </li>

        <li>
            <a href="/admin/users" data-link>
            <span class="sidebar-icon">👤</span>
            <span>Usuarios</span>
            </a>
        </li>

        <li>
            <a href="/admin/reports" data-link>
            <span class="sidebar-icon">📈</span>
            <span>Reportes</span>
            </a>
        </li>
        `;

    return;
  }

  sidebarMenu.innerHTML = `
    <li>
      <a href="/seller/dashboard" data-link>
        <span class="sidebar-icon">📊</span>
        <span>Dashboard</span>
      </a>
    </li>

    <li>
      <a href="/seller/customers" data-link>
        <span class="sidebar-icon">👥</span>
        <span>Clientes</span>
      </a>
    </li>

    <li>
      <a href="/seller/sales" data-link>
        <span class="sidebar-icon">💰</span>
        <span>Ventas</span>
      </a>
    </li>
  `;
}

function setPageContent(content: string): void {
    const pageContent = document.querySelector<HTMLElement>("#page-content");

    if (!pageContent) {
        throw new Error("No se encontró el contenedor de la página.");
    }

    pageContent.innerHTML = content;
}

function setupNavigation(): void {
    const links =
        document.querySelectorAll<HTMLAnchorElement>("[data-link]");

    links.forEach((link) => {
        const href = link.getAttribute("href");

        if (href === window.location.pathname) {
        link.classList.add("active");
        }

        link.addEventListener("click", (event) => {
        event.preventDefault();

        closeMobileMenu();
        navigate(href ?? "/");
        });
    });
}

function setupLogout(): void {
    const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");
    const modal = document.querySelector<HTMLDivElement>("#logout-modal");
    const cancelButton = document.querySelector<HTMLButtonElement>("#cancel-logout-button");
    const confirmButton = document.querySelector<HTMLButtonElement>("#confirm-logout-button");

    if (!logoutButton || !modal || !cancelButton || !confirmButton) 
        return;
    
    logoutButton.addEventListener("click", () => {
        modal.classList.add("open");
    });

    cancelButton.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    confirmButton.addEventListener("click", () => {
        logout();
        navigate("/login");
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
        modal.classList.remove("open");
        }
    });
}

function setupMobileMenu(): void {
    const menuButton =
        document.querySelector<HTMLButtonElement>("#menu-button");

    const closeButton =
        document.querySelector<HTMLButtonElement>("#close-menu-button");

    const overlay =
        document.querySelector<HTMLDivElement>("#sidebar-overlay");

    if (!menuButton || !closeButton || !overlay) return;

    menuButton.addEventListener("click", openMobileMenu);
    closeButton.addEventListener("click", closeMobileMenu);
    overlay.addEventListener("click", closeMobileMenu);
}

function openMobileMenu(): void {
    const sidebar = document.querySelector<HTMLElement>("#app-sidebar");
    const menuButton =
        document.querySelector<HTMLButtonElement>("#menu-button");

    if (!sidebar || !menuButton) return;

    sidebar.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");
}

function closeMobileMenu(): void {
    const sidebar = document.querySelector<HTMLElement>("#app-sidebar");
    const menuButton =
        document.querySelector<HTMLButtonElement>("#menu-button");

    if (!sidebar || !menuButton) return;

    sidebar.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
}