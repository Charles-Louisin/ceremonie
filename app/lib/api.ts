import type { GalaState, ID, Invite, TableGala } from "./types";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  getState: (signal?: AbortSignal) =>
    request<GalaState>("/api/state", { method: "GET" }, signal),

  reset: () => request<GalaState>("/api/reset", { method: "POST" }),

  createTable: (input: {
    id?: ID;
    nom: string;
    capacite?: number;
    hotesseInviteId?: ID | null;
  }) =>
    request<TableGala>("/api/tables", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateTable: (id: ID, patch: Partial<Omit<TableGala, "id">>) =>
    request<TableGala>(`/api/tables/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteTable: (id: ID) =>
    request<void>(`/api/tables/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  createInvite: (input: {
    id?: ID;
    nom: string;
    nbPersonnes?: number;
    tableId?: ID | null;
    estPresent?: boolean;
    heureArrivee?: string | null;
  }) =>
    request<Invite>("/api/invites", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateInvite: (id: ID, patch: Partial<Omit<Invite, "id">>) =>
    request<Invite>(`/api/invites/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteInvite: (id: ID) =>
    request<void>(`/api/invites/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  setPresence: (id: ID, present: boolean) =>
    request<Invite>(`/api/invites/${encodeURIComponent(id)}/presence`, {
      method: "POST",
      body: JSON.stringify({ present }),
    }),
};

export { ApiError };
