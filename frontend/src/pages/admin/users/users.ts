import usersHtml from "./users.html?raw";

import { renderLayout } from "../../shared/layout";
import { getUserByFilter, createUser, updateUser, delUser, type UserFilter, type User, activateUser, type Role } from "../../../services/users/userService";
import { renderPagination } from "../../../components/pagination/pagination";
import { getCrudStateContainer, renderCrudStates, showCrudState } from "../../../components/crud-state/crudState";
import { createPaginationState } from "../../../components/pagination/paginationState";
import { withLoadingButton } from "../../../components/loading/withLoadingButton";
import { sortItems } from "../../../utils/sort";

const pagination = createPaginationState<User>();

let editingUserId: number | null = null;
let currentSortColumn: keyof User | null = null;
let currentSortDirection: "asc" | "desc" | null = null;
let resettingPasswordUserId: number | null = null;

export function renderUsers(): void {
    renderLayout(usersHtml);

    const crudContainer = document.querySelector<HTMLElement>("#users-crud");
    if (!crudContainer) 
        return;

    
    renderCrudStates(crudContainer);

    const searchButton = document.querySelector<HTMLButtonElement>("#search-users");
    searchButton?.addEventListener("click", searchUsers);

    const searchInputs = document.querySelectorAll<HTMLInputElement>(".crud-filters input");
    searchInputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
            searchUsers();
            }
        });
    });

    const addUserButton = document.querySelector<HTMLButtonElement>("#new-user-button");

    addUserButton?.addEventListener("click",() => openUserModal());

    const closeModalButton = document.querySelector<HTMLButtonElement>("#user-modal-close");
    const closePasswordModalButton = document.querySelector<HTMLButtonElement>("#user-password-modal-close");

    const cancelModalButton = document.querySelector<HTMLButtonElement>("#user-modal-cancel");
    const cancelPasswordModalButton = document.querySelector<HTMLButtonElement>("#user-password-modal-cancel");
    closeModalButton?.addEventListener("click", closeUserModal);
    cancelModalButton?.addEventListener("click", closeUserModal);
    closePasswordModalButton?.addEventListener("click", closeUserPasswordModal);
    cancelPasswordModalButton?.addEventListener("click", closeUserPasswordModal);

    const userForm = document.querySelector<HTMLFormElement>("#user-form");
    userForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitButton = userForm.querySelector<HTMLButtonElement>('button[type="submit"]');

        void withLoadingButton(
            submitButton,
            () => handleUserSubmit(event),
            "Guardando..."
        );
    });

    const userPasswordForm = document.querySelector<HTMLFormElement>("#user-password-form");

    userPasswordForm?.addEventListener("submit", (event: SubmitEvent) => {
        event.preventDefault();

        const submitButton = userPasswordForm.querySelector<HTMLButtonElement>('button[type="submit"]');

        void withLoadingButton(
            submitButton,
            () => handleUserSubmit(event),
            "Guardando..."
        );

    });


    crudContainer.addEventListener("click",handleUserAction);
}

async function searchUsers(): Promise<void> {
    const searchButton = document.querySelector<HTMLButtonElement>("#search-users");

    await withLoadingButton(
        searchButton,
        async () => {
            pagination.currentPage = 1;
            await loadUsers();
        },
        "Buscando..."
    );
}

async function loadUsers(): Promise<void> {   
    const nameInput = document.querySelector<HTMLInputElement>("#user-search");
    const emailInput = document.querySelector<HTMLInputElement>("#user-email");
    const roleSelect = document.querySelector<HTMLSelectElement>("#user-role");
    const statusSelect = document.querySelector<HTMLSelectElement>("#user-status");

    const crudContainer = document.querySelector<HTMLElement>("#users-crud");

    if (!crudContainer) 
        return;
    
    const filter: UserFilter = {
        name: nameInput?.value.trim() || undefined,
        email: emailInput?.value.trim() || undefined,
        role: roleSelect?.value as Role || undefined,
        active: statusSelect?.value === "active" ? true : statusSelect?.value === "inactive" ? false : undefined
    };
    

    try {

        const users = await getUserByFilter({
            ...filter,
            page: pagination.currentPage,
            pageSize: pagination.pageSize
        });
        
        if (users.items.length === 0) {
            pagination.items = [];
            pagination.totalPages = 0;
            pagination.totalItems = 0;

            showCrudState(crudContainer, "no-results");
            return;
        }

        pagination.items = users.items;
        pagination.totalPages = users.totalPages;
        pagination.totalItems = users.totalItems;

        showCrudState(crudContainer, "results");

        renderUsersPage();

        } catch (error) {
            alert("Error al buscar usuarios: " + error);
    }
}

function renderUsersTable(users: User[]): void {

    const crudContainer = document.querySelector<HTMLElement>("#users-crud");
    if (!crudContainer) 
        return;
    
    const resultsContainer = getCrudStateContainer(crudContainer, "results");
    if (!resultsContainer) 
        return;

    resultsContainer.innerHTML = `
        <div class="crud-table-header">
            <h3>Usuarios</h3>
            <span class="crud-count">
                ${pagination.totalItems} usuarios
            </span>
        </div>

        <div class="crud-table-scroll">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th data-sort="name" class="${currentSortColumn === "name" ? "is-sorted" : ""}">
                            Nombre${getSortIndicator("name")}
                        </th>
                        <th data-sort="email" class="${currentSortColumn === "email" ? "is-sorted" : ""}">
                            Email${getSortIndicator("email")}
                        </th>
                        <th data-sort="role" class="${currentSortColumn === "role" ? "is-sorted" : ""}">
                            Rol${getSortIndicator("role")}
                        </th>
                        <th data-sort="active" class="${currentSortColumn === "active" ? "is-sorted" : ""}">
                            Estado${getSortIndicator("active")}
                        </th>
                        <th class="crud-actions-heading">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <span class="status-badge ${user.active ? "is-active" : "is-inactive"}">
                                    ${user.active ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <div class="crud-actions">
                                    <button class="btn-icon btn-edit" type="button" title="Editar" data-user-id="${user.id}">✎</button>
                                    <button class="btn-icon btn-edit btn-reset-password" type="button" title="Restablecer contraseña" data-action="reset-password" data-user-id="${user.id}">*</button>
                                    ${user.active? `
                                                <button class="btn-icon btn-delete" type="button" title="Desactivar" data-user-id="${user.id}">🗑</button>
                                            `: `
                                                <button class="btn-icon btn-activate" type="button" title="Activar" data-user-id="${user.id}">↻</button>
                                            `
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>

        <div class="crud-pagination" id="users-pagination"></div>
    `;

}

function renderUsersPage(): void {

    renderUsersTable(pagination.items);

    const crudContainer = document.querySelector<HTMLElement>("#users-crud");

    if (!crudContainer) 
        return;

    const resultsContainer = getCrudStateContainer(crudContainer, "results");

    if (!resultsContainer) 
        return;

    const paginationContainer = resultsContainer.querySelector<HTMLElement>("#users-pagination");
    if (!paginationContainer) 
        return;
    
    renderPagination(paginationContainer, {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        onPageChange: (page) => {
            pagination.currentPage = page;
            loadUsers();
        }
    });
}

function openUserModal(user?: User): void {
    const modal = document.querySelector<HTMLElement>("#user-modal");
    const title = document.querySelector<HTMLElement>("#user-modal-title");
    const nameInput = document.querySelector<HTMLInputElement>("#user-name-input");
    const emailInput = document.querySelector<HTMLInputElement>("#user-email-input");
    const roleInput = document.querySelector<HTMLSelectElement>("#user-role-input");
    const passwordSection = document.querySelector<HTMLElement>("#user-password-section");
    const passwordInput = document.querySelector<HTMLInputElement>("#user-password");
    const passwordConfirmInput = document.querySelector<HTMLInputElement>("#user-password-confirm");
    const errorMessage = document.querySelector<HTMLElement>("#new-user-password-error");
    const saveButton = document.querySelector<HTMLButtonElement>("#user-save-button");
    editingUserId = user?.id ?? null;

    const isEditing = user !== undefined;

    title!.textContent = isEditing ? "Editar usuario" : "Nuevo usuario";
    saveButton!.textContent = isEditing ? "Guardar cambios" : "Guardar usuario";

    nameInput!.value = user?.name ?? "";
    emailInput!.value = user?.email ?? "";
    roleInput!.value = user?.role ?? "seller";

    // La contraseña inicial solo se solicita al crear el usuario.
    passwordSection!.hidden = isEditing;
    passwordInput!.required = !isEditing;
    passwordConfirmInput!.required = !isEditing;

    passwordInput!.value = "";
    passwordConfirmInput!.value = "";

    if (errorMessage) {
        errorMessage!.textContent = "";
        errorMessage!.hidden = true;
    }

    modal!.hidden = false;
    nameInput!.focus();
}


function openUserPasswordModal(user: User): void {
    const modal = document.querySelector<HTMLElement>("#user-password-modal");
    const userName = document.querySelector<HTMLElement>("#user-password-name");
    const form = document.querySelector<HTMLFormElement>("#user-password-form");
    const passwordInput = document.querySelector<HTMLInputElement>("#change-user-password");
    const errorMessage = document.querySelector<HTMLElement>("#change-user-password-error");
    const resettingPasswordUserNameInput = document.querySelector<HTMLInputElement>("#resetting-password-user-name");
    const resettingPasswordUserMailInput = document.querySelector<HTMLInputElement>("#resetting-password-user-mail");
    const resettingPasswordUserRoleInput = document.querySelector<HTMLInputElement>("#resetting-password-user-role");

    resettingPasswordUserId = user.id;
    resettingPasswordUserNameInput!.value = user.name;
    resettingPasswordUserMailInput!.value = user.email;
    resettingPasswordUserRoleInput!.value = user.role;

    form!.reset();
    userName!.textContent = user.name;

    if (errorMessage) {
        errorMessage!.textContent = "";
        errorMessage!.hidden = true;
    }

    modal!.hidden = false;
    passwordInput!.focus();
}

function passwordsMatch(password: string, confirmation: string): boolean {
    return password === confirmation;
}

function closeUserPasswordModal(): void {
    const modal = document.querySelector<HTMLElement>("#user-password-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    resettingPasswordUserId = null;
}


function closeUserModal(): void {
    const modal = document.querySelector<HTMLElement>("#user-modal");
    if (!modal) 
        return;
    
    modal.hidden = true;
    editingUserId = null;
}

async function handleUserSubmit(event: SubmitEvent): Promise<void> {

    event.preventDefault();
    let passwordInput: HTMLInputElement | null,
    confirmationInput: HTMLInputElement | null, errorMessage: HTMLElement | null,
    nameInput: HTMLInputElement | null, roleInput: HTMLSelectElement | null, emailInput: HTMLInputElement | null;


    if(resettingPasswordUserId !== null) {
        passwordInput = document.querySelector<HTMLInputElement>("#change-user-password");
        confirmationInput = document.querySelector<HTMLInputElement>("#change-user-password-confirm");
        errorMessage = document.querySelector<HTMLElement>("#change-user-password-error")
        nameInput = document.querySelector<HTMLInputElement>("#resetting-password-user-name");
        roleInput = document.querySelector<HTMLSelectElement>("#resetting-password-user-role");
        emailInput = document.querySelector<HTMLInputElement>("#resetting-password-user-mail");
        if (!passwordsMatch(passwordInput?.value ?? "", confirmationInput?.value ?? "")) {
            errorMessage!.textContent = "Las contraseñas no coinciden.";
            errorMessage!.hidden = false;
            confirmationInput!.focus();
            return;
        }
    } else{
        passwordInput = document.querySelector<HTMLInputElement>("#user-password");
        confirmationInput = document.querySelector<HTMLInputElement>("#user-password-confirm");
        errorMessage = document.querySelector<HTMLElement>("#new-user-password-error");
        nameInput = document.querySelector<HTMLInputElement>("#user-name-input");
        roleInput = document.querySelector<HTMLSelectElement>("#user-role-input");
        emailInput = document.querySelector<HTMLInputElement>("#user-email-input");
        if (editingUserId === null && !passwordsMatch(passwordInput?.value ?? "", confirmationInput?.value ?? "")) {
            errorMessage!.textContent = "Las contraseñas no coinciden.";
            errorMessage!.hidden = false;
            confirmationInput!.focus();
            return;
        }
    }

    const user = {
        name: nameInput?.value.trim() ?? "",
        password: passwordInput?.value.trim() ?? "",
        role: (roleInput?.value as Role) ?? "Seller",
        email: emailInput?.value.trim() ?? ""
    };

    try {
        if (editingUserId) {
            await updateUser(editingUserId, user);
            alert("Usuario actualizado exitosamente.");
            closeUserModal();
        } else if (resettingPasswordUserId) {
            await updateUser(resettingPasswordUserId, user);
            alert("Contraseña actualizada exitosamente.");
            closeUserPasswordModal();
        } else {
            await createUser(user);
            alert("Usuario creado exitosamente.");
            closeUserModal();
        }
        
        await searchUsers();

    } catch (error) {
        const message = error instanceof Error
        ? "Error: " + error.message
        : "No se pudo crear el usuario o actualizarlo. Intentá nuevamente.";

        console.error("Error al crear el usuario:",error);
        alert(message);
    }
}

async function handleUserAction(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const editButton =target.closest<HTMLButtonElement>(".btn-edit");
    
    const sortHeader = target.closest<HTMLElement>("[data-sort]");

    if (sortHeader) {
        const column = sortHeader.dataset.sort as keyof User;
        sortUsers(column);
        return;
    }
    
    //Editar usuario
    if (editButton) {
        const userId = Number(editButton.dataset.userId);
        const user = pagination.items.find(user => Number(user.id) === userId);
        if (!user) 
            return;

        const errorMessage = document.querySelector<HTMLElement>("#user-password-error");
        errorMessage?.setAttribute("hidden", "true");

        if (editButton?.classList.contains("btn-reset-password"))
            openUserPasswordModal(user);
        else
            openUserModal(user);
        return;
    }


    //Eliminar usuario
    const deleteButton = target.closest<HTMLButtonElement>(".btn-delete");
    if (deleteButton){
        const userId = Number(deleteButton.dataset.userId);
        const confirmed = confirm("¿Estás seguro de que querés desactivar este usuario?");
        if (!confirmed) 
            return;

        try {
            await delUser(userId);
            console.log("Usuario desactivado:", userId);
            alert("Usuario desactivado exitosamente.");
            await searchUsers();
        } catch (error) {
            console.error("Error al desactivar el usuario:",error);
            alert("No se pudo desactivar el usuario. Intentá nuevamente.");
        }
        return;
    } 

    //Rehabilitar usuario
    const activateButton =target.closest<HTMLButtonElement>(".btn-activate");

    if (activateButton) {
        const userId = Number(activateButton.dataset.userId);
        const confirmed = confirm("¿Estás seguro de que querés activar este usuario?");
        if (!confirmed) 
            return;

        try {
            const user = pagination.items.find(user => Number(user.id) === userId);
            if (!user) 
                return;
            await activateUser(userId);
            alert("Usuario activado exitosamente.");
            await searchUsers();
        } catch (error) {
            console.error("Error al activar el usuario:", error);
            alert("No se pudo activar el usuario. Intentá nuevamente.");
        }

        return;
    }
}

function sortUsers(column: keyof User): void {
    if (currentSortColumn !== column) {
        currentSortColumn = column;
        currentSortDirection = "asc";
    } else if (currentSortDirection === "asc") {
        currentSortDirection = "desc";
    } else {
        currentSortColumn = null;
        currentSortDirection = null;
    }

    if (currentSortColumn && currentSortDirection) {
        pagination.items = sortItems(
            pagination.items,
            currentSortColumn,
            currentSortDirection
        );
    }

    renderUsersPage();
}

function getSortIndicator(column: keyof User): string {

    if (currentSortColumn !== column) 
        return "";
    
    return currentSortDirection === "asc" ? " ↑" : " ↓";
}