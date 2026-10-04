import notFoundHtml from "./notfound.html?raw";

import { renderLayout } from "../shared/layout";
import { getCurrentUser } from "../../services/auth/authSession";
import { navigate } from "../../router/router";

export function renderNotFound(): void {
    const user = getCurrentUser();

    if (!user) {
        navigate("/login");
        return;
    }

    renderLayout(notFoundHtml);

    const button = document.querySelector<HTMLButtonElement>("#back-dashboard-button");

    if (!button) return;

    button.addEventListener("click", () => {
        window.history.back();
    });
}