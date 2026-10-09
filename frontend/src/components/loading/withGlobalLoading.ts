let pendingOperations = 0;
let overlay: HTMLDivElement | null = null;

function showOverlay(message: string): void {
    if (overlay) {
        return;
    }

    overlay = document.createElement("div");
    overlay.className = "global-loading-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");

    overlay.innerHTML = `
        <div class="global-loading-content">
            <span class="global-spinner" aria-hidden="true"></span>
            <span class="global-loading-message"></span>
        </div>
    `;

    const messageElement = overlay.querySelector(
        ".global-loading-message"
    );

    if (messageElement) {
        messageElement.textContent = message;
    }

    document.body.appendChild(overlay);
}

function hideOverlay(): void {
    overlay?.remove();
    overlay = null;
}

export async function withGlobalLoading<T>(
    action: () => Promise<T>,
    message = "Procesando..."
): Promise<T> {
    if (pendingOperations === 0) {
        showOverlay(message);
    }

    pendingOperations++;

    try {
        return await action();
    } finally {
        pendingOperations--;

        if (pendingOperations === 0) {
            hideOverlay();
        }
    }
}
