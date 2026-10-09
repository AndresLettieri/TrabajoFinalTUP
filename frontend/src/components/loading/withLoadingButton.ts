export async function withLoadingButton(
    button: HTMLButtonElement | null,
    action: () => Promise<void>,
    loadingText = "Procesando..."
): Promise<void> {
    if (button?.disabled) {
        return;
    }

    if (!button) {
        await action();
        return;
    }

    const originalContent = button.innerHTML;

    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");

    button.innerHTML = `
        <span class="button-spinner" aria-hidden="true"></span>
        <span>${loadingText}</span>
    `;

    try {
        await action();
    } finally {
        button.innerHTML = originalContent;
        button.disabled = false;
        button.classList.remove("is-loading");
        button.removeAttribute("aria-busy");
    }
}