const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "nuvora.token";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("nuvora:unauthorized"));
  }

  if (!response.ok) {
    let message = "Não foi possível concluir a solicitação.";
    try {
      const payload = (await response.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(payload.message)) {
        message = payload.message.join(" ");
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Keep the generic message when the body is not JSON.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "E-mail ou senha inválidos.";
    if (error.status === 409) {
      return "Já existe uma conta com esses dados. Confira e tente novamente.";
    }
    if (error.status === 400) {
      return "Confira os dados e tente novamente.";
    }
    return error.message;
  }
  return "Não foi possível conectar à API. Verifique se o servidor está no ar.";
}
