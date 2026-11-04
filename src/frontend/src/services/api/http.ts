import { getCurrentUser } from "../auth/authSession";
import { withGlobalLoading } from "../../components/loading/withGlobalLoading";

const API_URL = import.meta.env.VITE_API_URL;

function getUserId(): number {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("No hay un usuario autenticado.");
    }

    return currentUser.id;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    return withGlobalLoading(async () => {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return response.json() as Promise<T>;
    });
}

function jsonOptions(method: string, body: unknown): RequestInit {
    return {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}

export async function get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint);
}

export async function getByFilter<T>(
    endpoint: string,
    filter: Record<string, unknown>
): Promise<T> {
    const params = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });

    const query = params.toString();
    const url = query ? `${endpoint}?${query}` : endpoint;

    return request<T>(url);
}

export async function post<T>(
    endpoint: string,
    body: unknown,
    includeUserId = true
): Promise<T> {
    const requestBody = includeUserId
        ? {
            ...body as object,
            userId: getUserId()
        }
        : body;

    return request<T>(
        endpoint,
        jsonOptions("POST", requestBody)
    );
}

export async function put<T>(
    endpoint: string,
    body: unknown
): Promise<T> {
    return request<T>(
        endpoint,
        jsonOptions("PUT", {
            ...body as object,
            userId: getUserId()
        })
    );
}

export async function del<T>(endpoint: string): Promise<T> {
    return request<T>(
        endpoint,
        jsonOptions("DELETE", {
            userId: getUserId()
        })
    );
}

export async function patch<T>(endpoint: string): Promise<T> {
    return request<T>(
        endpoint,
        jsonOptions("PATCH", {
            userId: getUserId()
        })
    );
}

async function getErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data.message === "string") {
            return data.message;
        }

        if (typeof data.title === "string") {
            return data.title;
        }
    } catch {
        // La respuesta no contiene JSON válido.
    }

    return `Error en la solicitud (${response.status}).`;
}