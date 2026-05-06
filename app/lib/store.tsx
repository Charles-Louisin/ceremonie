"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { GalaState, ID, Invite, TableGala } from "./types";
import { TABLE_CAPACITY } from "./types";
import { api, ApiError } from "./api";
import { makeUid, nowIso } from "./utils";

type Status = "loading" | "ready" | "error";

interface InternalState extends GalaState {
  status: Status;
  errorMessage: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; state: GalaState }
  | { type: "FETCH_ERROR"; message: string }
  | { type: "UPSERT_INVITE"; invite: Invite }
  | { type: "DELETE_INVITE"; inviteId: ID }
  | { type: "UPSERT_TABLE"; table: TableGala }
  | { type: "DELETE_TABLE"; tableId: ID };

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", errorMessage: null };

    case "FETCH_SUCCESS":
      return {
        ...action.state,
        status: "ready",
        errorMessage: null,
      };

    case "FETCH_ERROR":
      return { ...state, status: "error", errorMessage: action.message };

    case "UPSERT_INVITE": {
      const exists = state.invites.some((g) => g.id === action.invite.id);
      return {
        ...state,
        invites: exists
          ? state.invites.map((g) => (g.id === action.invite.id ? action.invite : g))
          : [...state.invites, action.invite],
      };
    }

    case "DELETE_INVITE":
      return {
        ...state,
        invites: state.invites.filter((g) => g.id !== action.inviteId),
        tables: state.tables.map((t) =>
          t.hotesseInviteId === action.inviteId
            ? { ...t, hotesseInviteId: null, hotesseNom: null }
            : t,
        ),
      };

    case "UPSERT_TABLE": {
      const exists = state.tables.some((t) => t.id === action.table.id);
      return {
        ...state,
        tables: exists
          ? state.tables.map((t) => (t.id === action.table.id ? action.table : t))
          : [...state.tables, action.table],
      };
    }

    case "DELETE_TABLE":
      return {
        ...state,
        tables: state.tables.filter((t) => t.id !== action.tableId),
        invites: state.invites.map((g) =>
          g.tableId === action.tableId ? { ...g, tableId: null } : g,
        ),
      };

    default:
      return state;
  }
}

interface GalaApi {
  state: GalaState;
  status: Status;
  errorMessage: string | null;
  refetch: () => Promise<void>;

  toggleInvitePresent: (inviteId: ID) => Promise<void>;
  setInvitePresent: (inviteId: ID, present: boolean) => Promise<void>;
  upsertInvite: (
    invite: Partial<Invite> & { nom: string },
  ) => Promise<Invite | null>;
  deleteInvite: (inviteId: ID) => Promise<void>;
  upsertTable: (
    table: Partial<TableGala> & { nom: string },
  ) => Promise<TableGala | null>;
  deleteTable: (tableId: ID) => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<GalaApi | null>(null);

const initialState: InternalState = {
  tables: [],
  invites: [],
  status: "loading",
  errorMessage: null,
};

export function GalaProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refetch = useCallback(async () => {
    try {
      const data = await api.getState();
      dispatch({ type: "FETCH_SUCCESS", state: data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur réseau inconnue";
      dispatch({ type: "FETCH_ERROR", message });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const data = await api.getState();
        if (!cancelled) dispatch({ type: "FETCH_SUCCESS", state: data });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Erreur réseau inconnue";
        dispatch({ type: "FETCH_ERROR", message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Exécute une mise à jour optimiste :
   * 1. Dispatch local immédiat (UI réactive).
   * 2. Appel API en arrière-plan.
   * 3. Ré-sync depuis le serveur en cas d'erreur (rollback automatique).
   *
   * Les erreurs sont consommées en interne pour éviter les rejets non gérés ;
   * un message est affiché via `errorMessage` quand le refetch échoue aussi.
   */
  const runOptimistic = useCallback(
    async <T,>(args: {
      optimistic: () => void;
      call: () => Promise<T>;
      onSuccess?: (result: T) => void;
    }): Promise<T | null> => {
      args.optimistic();
      try {
        const result = await args.call();
        args.onSuccess?.(result);
        return result;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur réseau";
        if (process.env.NODE_ENV !== "production") {
          console.error("[gala] mutation failed:", message);
        }
        await refetch();
        return null;
      }
    },
    [refetch],
  );

  const setInvitePresent = useCallback(
    async (inviteId: ID, present: boolean) => {
      const existing = state.invites.find((g) => g.id === inviteId);
      if (!existing) return;
      const optimistic: Invite = {
        ...existing,
        estPresent: present,
        heureArrivee: present ? nowIso() : null,
      };
      await runOptimistic<Invite>({
        optimistic: () => dispatch({ type: "UPSERT_INVITE", invite: optimistic }),
        call: () => api.setPresence(inviteId, present),
        onSuccess: (server) =>
          dispatch({ type: "UPSERT_INVITE", invite: server }),
      });
    },
    [runOptimistic, state.invites],
  );

  const toggleInvitePresent = useCallback(
    async (inviteId: ID) => {
      const existing = state.invites.find((g) => g.id === inviteId);
      if (!existing) return;
      await setInvitePresent(inviteId, !existing.estPresent);
    },
    [setInvitePresent, state.invites],
  );

  const upsertInvite = useCallback(
    async (input: Partial<Invite> & { nom: string }): Promise<Invite | null> => {
      const isUpdate = !!input.id && state.invites.some((g) => g.id === input.id);
      const draft: Invite = {
        id: input.id ?? makeUid("g"),
        nom: input.nom,
        nbPersonnes: Math.max(1, Math.floor(input.nbPersonnes ?? 1)),
        tableId: input.tableId ?? null,
        estPresent: input.estPresent ?? false,
        heureArrivee: input.heureArrivee ?? null,
      };
      return runOptimistic<Invite>({
        optimistic: () => dispatch({ type: "UPSERT_INVITE", invite: draft }),
        call: () =>
          isUpdate
            ? api.updateInvite(draft.id, {
                nom: draft.nom,
                nbPersonnes: draft.nbPersonnes,
                tableId: draft.tableId,
                estPresent: draft.estPresent,
                heureArrivee: draft.heureArrivee,
              })
            : api.createInvite(draft),
        onSuccess: (server) =>
          dispatch({ type: "UPSERT_INVITE", invite: server }),
      });
    },
    [runOptimistic, state.invites],
  );

  const deleteInvite = useCallback(
    async (inviteId: ID) => {
      await runOptimistic<void>({
        optimistic: () => dispatch({ type: "DELETE_INVITE", inviteId }),
        call: () => api.deleteInvite(inviteId),
      });
    },
    [runOptimistic],
  );

  const upsertTable = useCallback(
    async (input: Partial<TableGala> & { nom: string }): Promise<TableGala | null> => {
      const isUpdate = !!input.id && state.tables.some((t) => t.id === input.id);
      const draft: TableGala = {
        id: input.id ?? makeUid("t"),
        nom: input.nom,
        capacite: input.capacite ?? TABLE_CAPACITY,
        hotesseInviteId: input.hotesseInviteId ?? null,
        hotesseNom: input.hotesseNom ?? null,
      };
      return runOptimistic<TableGala>({
        optimistic: () => dispatch({ type: "UPSERT_TABLE", table: draft }),
        call: () =>
          isUpdate
            ? api.updateTable(draft.id, {
                nom: draft.nom,
                capacite: draft.capacite,
                hotesseInviteId: draft.hotesseInviteId,
                hotesseNom: draft.hotesseNom,
              })
            : api.createTable(draft),
        onSuccess: (server) =>
          dispatch({ type: "UPSERT_TABLE", table: server }),
      });
    },
    [runOptimistic, state.tables],
  );

  const deleteTable = useCallback(
    async (tableId: ID) => {
      await runOptimistic<void>({
        optimistic: () => dispatch({ type: "DELETE_TABLE", tableId }),
        call: () => api.deleteTable(tableId),
      });
    },
    [runOptimistic],
  );

  const resetAll = useCallback(async () => {
    try {
      const fresh = await api.reset();
      dispatch({ type: "FETCH_SUCCESS", state: fresh });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Échec de la réinitialisation";
      dispatch({ type: "FETCH_ERROR", message });
    }
  }, []);

  const publicState: GalaState = useMemo(
    () => ({ tables: state.tables, invites: state.invites }),
    [state.tables, state.invites],
  );

  const value = useMemo<GalaApi>(
    () => ({
      state: publicState,
      status: state.status,
      errorMessage: state.errorMessage,
      refetch,
      toggleInvitePresent,
      setInvitePresent,
      upsertInvite,
      deleteInvite,
      upsertTable,
      deleteTable,
      resetAll,
    }),
    [
      publicState,
      state.status,
      state.errorMessage,
      refetch,
      toggleInvitePresent,
      setInvitePresent,
      upsertInvite,
      deleteInvite,
      upsertTable,
      deleteTable,
      resetAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGala(): GalaApi {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useGala doit être utilisé à l'intérieur de <GalaProvider>");
  }
  return ctx;
}

export function useInvitesByTable(tableId: ID): Invite[] {
  const { state } = useGala();
  return useMemo(
    () => state.invites.filter((g) => g.tableId === tableId),
    [state.invites, tableId],
  );
}

export function useTableById(tableId: ID | null): TableGala | undefined {
  const { state } = useGala();
  return useMemo(
    () => state.tables.find((t) => t.id === tableId),
    [state.tables, tableId],
  );
}
