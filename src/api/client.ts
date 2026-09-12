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

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in: string;
  check_out: string;
}

export interface Overtime {
  employee_id: number;
  name: string;
  total_hours: number;
  overtime_hours: number;
}

export interface Coverage {
  date: string;
  headcount: number;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: { row: number; error: string }[] | null;
}

export interface Me {
  id: number;
  email: string;
  role: "admin" | "manager" | "staff";
}

export interface ShiftIn {
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
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
  createShift: (token: string, s: ShiftIn) =>
    req<Shift>("/v1/shifts", token, { method: "POST", body: JSON.stringify(s) }),
  updateShift: (token: string, id: number, s: ShiftIn) =>
    req<Shift>(`/v1/shifts/${id}`, token, { method: "PUT", body: JSON.stringify(s) }),
  deleteShift: (token: string, id: number) =>
    req<void>(`/v1/shifts/${id}`, token, { method: "DELETE" }),
  checkIn: (token: string, employee_id?: number) =>
    req<{ status: string }>("/v1/attendance/check-in", token, {
      method: "POST",
      body: JSON.stringify({ employee_id: employee_id ?? 0 }),
    }),
  checkOut: (token: string, employee_id?: number) =>
    req<{ status: string }>("/v1/attendance/check-out", token, {
      method: "POST",
      body: JSON.stringify({ employee_id: employee_id ?? 0 }),
    }),
  attendance: (token: string, from: string, to: string, employee_id?: number) =>
    req<Attendance[]>(
      `/v1/attendance?from=${from}&to=${to}${employee_id ? `&employee_id=${employee_id}` : ""}`,
      token
    ),
  overtime: (token: string, from: string, to: string) =>
    req<Overtime[]>(`/v1/reports/overtime?from=${from}&to=${to}`, token),
  coverage: (token: string, date: string) =>
    req<Coverage[]>(`/v1/reports/coverage${date ? `?date=${date}` : ""}`, token),
};

export async function importCSV(token: string, file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(API_URL + "/v1/employees/import", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `http ${res.status}`);
  }
  return (await res.json()) as ImportResult;
}
