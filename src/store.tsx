import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Store } from "./model";
import { uid, validStore } from "./model";
import { createSeed } from "./seed";
export const STORAGE_KEY = "traqeer.operations.v1";
type Mutator = (state: Store) => Store;
interface StoreContextValue {
  state: Store;
  mutate: (action: string, entity: string, update: Mutator) => boolean;
  error: string;
  reload: () => void;
  replace: (s: Store) => boolean;
  recover: () => boolean;
  corruptRaw: string;
}
const StoreContext = createContext<StoreContextValue | null>(null);
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createSeed(), error: "", raw: "" };
    const data = JSON.parse(raw);
    if (!validStore(data)) throw new Error();
    return { state: data as Store, error: "", raw: "" };
  } catch {
    let raw = "";
    try {
      raw = localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      /* unavailable storage */
    }
    return {
      state: createSeed(),
      error:
        "No se pudo abrir el almacenamiento local. Los datos originales se conservan; esta vista de ejemplo es de solo lectura hasta que revises la recuperación.",
      raw,
    };
  }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [state, setState] = useState<Store>(initial.state);
  const [error, setError] = useState(initial.error);
  const [corruptRaw, setCorruptRaw] = useState(initial.raw);
  const ref = useRef(state);
  const reload = useCallback(() => {
    const next = load();
    ref.current = next.state;
    setState(next.state);
    setError(next.error);
    setCorruptRaw(next.raw);
  }, []);
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reload();
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [reload]);
  const persist = (next: Store) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      ref.current = next;
      setState(next);
      setError("");
      setCorruptRaw("");
      return true;
    } catch {
      setError(
        "No se pudo guardar. Revisá el espacio o los permisos del navegador. Tus cambios no se aplicaron.",
      );
      return false;
    }
  };
  const mutate = (action: string, entity: string, update: Mutator) => {
    if (
      (ref.current.config.role === "viewer" &&
        action !== "Rol simulado cambiado") ||
      corruptRaw ||
      (error && error.includes("abrir"))
    )
      return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const current = JSON.parse(raw);
        if (!validStore(current)) {
          setError(
            "Los datos almacenados cambiaron y no son válidos. Recargá para revisar recuperación.",
          );
          return false;
        }
        if (current.revision !== ref.current.revision) {
          reload();
          setError(
            "Otro tab actualizó los datos. Se cargó su versión; repetí tu acción para evitar sobrescribirla.",
          );
          return false;
        }
      }
      const before = ref.current;
      const updated = update(before);
      if (updated === before) return false;
      // Capture changed entity arrays without recursively copying the audit log.
      const diffBefore: Record<string, unknown> = {},
        diffAfter: Record<string, unknown> = {};
      for (const k of Object.keys(updated) as (keyof Store)[])
        if (!["audit", "revision"].includes(k) && before[k] !== updated[k]) {
          if (Array.isArray(before[k]) && Array.isArray(updated[k])) {
            const old = before[k] as { id: string }[],
              nextRecords = updated[k] as { id: string }[];
            diffBefore[k] = old.filter(
              (x) =>
                JSON.stringify(x) !==
                JSON.stringify(nextRecords.find((n) => n.id === x.id)),
            );
            diffAfter[k] = nextRecords.filter(
              (x) =>
                JSON.stringify(x) !==
                JSON.stringify(old.find((n) => n.id === x.id)),
            );
          } else {
            diffBefore[k] = before[k];
            diffAfter[k] = updated[k];
          }
        }
      const next = {
        ...updated,
        revision: uid("REV"),
        audit: [
          {
            id: uid("AUD"),
            date: new Date().toISOString(),
            actor:
              before.config.role === "supervisor"
                ? "Supervisión · simulada"
                : "Toti Gauna",
            action,
            entity,
            before: diffBefore,
            after: diffAfter,
          },
          ...updated.audit,
        ],
      };
      if (!validStore(next)) {
        setError("El cambio contiene datos inválidos. No se guardó.");
        return false;
      }
      return persist(next);
    } catch {
      setError(
        "El almacenamiento no está disponible o contiene datos dañados. No se guardó el cambio.",
      );
      return false;
    }
  };
  const replace = (next: Store) => {
    if (!validStore(next) || ref.current.config.role === "viewer") return false;
    return persist({
      ...next,
      revision: uid("REV"),
      audit: [
        {
          id: uid("AUD"),
          date: new Date().toISOString(),
          actor: "Toti Gauna",
          action: "Importación / reinicio confirmado",
          entity: "Workspace",
          before: null,
          after: { version: next.version },
        },
        ...next.audit,
      ],
    });
  };
  const recover = () => replace(createSeed());
  return (
    <StoreContext.Provider
      value={{ state, mutate, error, reload, replace, recover, corruptRaw }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("StoreProvider required");
  return context;
};
