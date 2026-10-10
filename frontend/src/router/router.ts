import { renderLogin } from "../pages/login/login";

import { renderAdminDashboard } from "../pages/admin/dashboard/dashboard";
import { renderProducts } from "../pages/admin/products/products";
import { renderCategories } from "../pages/admin/categories/categories";
import { renderBrands } from "../pages/admin/brands/brands";
import { renderCustomers } from "../pages/customers/customers";
import { renderVendors } from "../pages/admin/vendors/vendors";
import { renderPurchases } from "../pages/admin/purchases/purchases";
import { renderNewPurchase } from "../pages/admin/purchases/newPurchase";
import { renderPurchaseDetail } from "../pages/admin/purchases/purchaseDetail";
import { renderSales } from "../pages/admin/sales/sales";
import { renderUsers } from "../pages/admin/users/users";
import { renderReports } from "../pages/admin/reports/reports";

import { renderSellerDashboard } from "../pages/seller/dashboard/dashboard";
import { renderSellerSales } from "../pages/seller/sales/sales";

import { renderNotFound } from "../pages/notFound/notFound";

import { getCurrentUser } from "../services/auth/authSession";

type Role = "Admin" | "Seller";

interface Route {
    render: () => void;
    roles?: Role[];
}

const routes: Record<string, Route> = {

    "/login": {
    render: renderLogin,
    },


    "/admin/dashboard": {
    render: renderAdminDashboard,
    roles: ["Admin"],
    },

    "/admin/products": {
    render: renderProducts,
    roles: ["Admin"],
    },

    "/admin/categories": {
    render: renderCategories,
    roles: ["Admin"],
    },

    "/admin/brands": {
    render: renderBrands,
    roles: ["Admin"],
    },

    "/admin/customers": {
    render: renderCustomers,
    roles: ["Admin"],
    },

    "/admin/vendors": {
    render: renderVendors,
    roles: ["Admin"],
    },

    "/admin/purchases": {
    render: renderPurchases,
    roles: ["Admin"],
    },

    "/admin/purchases/create": {
    render: renderNewPurchase,
    roles: ["Admin"],
    },

    "/admin/purchases/{id}": {
    render: renderPurchaseDetail,
    roles: ["Admin"],
    },
    "/admin/sales": {
    render: renderSales,
    roles: ["Admin"],
    },

    "/admin/users": {
    render: renderUsers,
    roles: ["Admin"],
    },

    "/admin/reports": {
    render: renderReports,
    roles: ["Admin"],
    },


    "/seller/dashboard": {
    render: renderSellerDashboard,
    roles: ["Seller"],
    },

    "/seller/sales": {
    render: renderSellerSales,
    roles: ["Seller"],
    },
    "/seller/customers": {
    render: renderCustomers,
    roles: ["Seller"],
    },
};

export function router(): void {
    const path = window.location.pathname;

    const purchaseDetailMatch = path.match(
        /^\/admin\/purchases\/(\d+)$/
    );

    const route =
        routes[path] ??
        (purchaseDetailMatch ? routes["/admin/purchases/{id}"] : undefined);

    // Ruta inexistente
    if (!route) {
        renderNotFound();
        return;
    }

    const user = getCurrentUser();

    if (!route.roles) {
        route.render();
        return;
    }

    if (!user) {
        navigate("/login");
        return;
    }

    if (!route.roles.includes(user.role)) {
        renderNotFound();
        return;
    }

    route.render();
}

export function navigate(path: string): void {
    window.history.pushState({}, "", path);
    router();
}

window.addEventListener("popstate", router);