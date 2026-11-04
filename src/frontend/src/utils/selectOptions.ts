export interface SelectOption {
    id: number;
    name: string;
}

export function populateSelect(
    select: HTMLSelectElement,
    items: SelectOption[],
    placeholder = "Seleccioná una opción"
): void {
    select.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    select.appendChild(defaultOption);

    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = item.name;
        select.appendChild(option);
    });
}

