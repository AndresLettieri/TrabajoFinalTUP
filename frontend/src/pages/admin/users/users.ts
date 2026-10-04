import usersHtml from "./users.html?raw";
import { renderLayout } from "../../shared/layout";

export function renderUsers(): void {
    renderLayout(usersHtml);
}