export type CrudState = "initial" | "no-results" | "results";

export interface CrudStateOptions {initialMessage?: string;noResultsMessage?: string;}

const INITIAL_MESSAGE = "Utilizá los filtros y presioná Buscar.";

const NO_RESULTS_MESSAGE = "No se encontraron resultados.";


export function renderCrudStates(container: HTMLElement): void {

    container.innerHTML = `
        <div class="crud-state-message" data-crud-state="initial">
            ${INITIAL_MESSAGE}
        </div>
        <div class="crud-state-message" data-crud-state="no-results" hidden>
            ${NO_RESULTS_MESSAGE}
        </div>

        <div data-crud-state="results" hidden></div>
    `;
}

export function showCrudState(container: HTMLElement,state: CrudState): void {
    const states =container.querySelectorAll<HTMLElement>("[data-crud-state]");
    states.forEach(element => {
        element.hidden =
            element.dataset.crudState !== state;
    });
}

export function getCrudStateContainer(container: HTMLElement,state: CrudState): HTMLElement | null {
    return container.querySelector<HTMLElement>(
        `[data-crud-state="${state}"]`
    );
}