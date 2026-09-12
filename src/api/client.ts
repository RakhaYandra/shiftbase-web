const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface Shift {
  id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  hire_date: string;
}

export interface Me {
  id: number;
  email: string;
  role: "admin" | "manager" | "staff";
}

async function req<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(API_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `http ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string }>("/v1/auth/login", null, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) => req<Me>("/v1/me", token),
  shifts: (token: string, date: string) =>
    req<Shift[]>(`/v1/shifts?date=${date}`, token),
  employees: (token: string) => req<Employee[]>("/v1/employees", token),
};
