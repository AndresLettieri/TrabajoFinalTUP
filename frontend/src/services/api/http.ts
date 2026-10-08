import { getCurrentUser } from "../auth/authSession";


const API_URL = import.meta.env.VITE_API_URL;

function getUserId(): number {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        throw new Error("No hay un usuario autenticado.");
    }

    return currentUser.id;
}



export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}

export async function post<T>(endpoint: string,body: unknown, includeUserId = true): Promise<T> {
  
    const requestBody = includeUserId
        ? {
            ...body as object,
            userId: getUserId()
        }
        : body;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
    });

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}

export async function put<T>(endpoint: string,body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        ...body as object,
        userId: getUserId()
    })
  });

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}

export async function del<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: getUserId()
            })
    });



    if (!response.ok) {
        throw new Error("Error al realizar la solicitud");
    }

    return response.json();
}