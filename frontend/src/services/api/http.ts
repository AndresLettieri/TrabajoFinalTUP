const API_URL = import.meta.env.VITE_API_URL;

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Error al realizar la solicitud");
  }

  return response.json();
}