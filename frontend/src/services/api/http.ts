const API_URL = import.meta.env.VITE_API_URL;

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}

export async function post<T>(endpoint: string,body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
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
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}

export async function del<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Error al realizar la solicitud");
    }

    return response.json();
}