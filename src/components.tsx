import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { dateLabel, isISODate, money } from "./model";
export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    customers: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" />
      </>
    ),
    tasks: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="3" />
        <path d="M9 5V3h6v2M8 13l3 3 5-6" />
      </>
    ),
    cases: (
      <>
        <path d="M3 7h7l2 3h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v3" />
      </>
    ),
    payments: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18m-13 5h3" />
      </>
    ),
    outreach: (
      <>
        <path d="m3 11 18-8-7 18-3-7-8-3ZM11 14 21 3" />
      </>
    ),
    communication: (
      <path d="M21 11a8 8 0 0 1-8 8H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4Z" />
    ),
    quality: (
      <>
        <path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7l8-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 3v18h17M8 16v-5m5 5V6m5 10v-8" />
      </>
    ),
    playbooks: (
      <>
        <path d="M12 5c-4-3-8-2-9 0v15c3-2 6-2 9 0 3-2 6-2 9 0V5c-2-2-6-3-9 0ZM12 5v15" />
      </>
    ),
    settings: (
      <>
        <path
          d="m9 3-.5 3-3 1-2-1-2 4 2 2v2l-2 2 2 4 3-1 2 1 .5 3h6l.5-3 3-1 2 1 2-4-2-2v-2l2-2-2-4-3 1-3-1-.5-3Z"
          transform="translate(0 -1) scale(.95)"
        />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 6 6" />
      </>
    ),
    plus: <path d="M12 4v16M4 12h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m4 12 5 5L20 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    left: <path d="m15 6-6 6 6 6" />,
    right: <path d="m9 6 6 6-6 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    bell: (
      <>
        <path d="M5 16v-6a7 7 0 0 1 14 0v6l2 2H3l2-2ZM9 21h6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 11h18m-13 5h3m3 0h2" />
      </>
    ),
    flag: (
      <>
        <path d="M5 22V3h13l-3 5 3 5H5" />
      </>
    ),
    vip: (
      <>
        <path d="m3 7 4 4 5-8 5 8 4-4-2 13H5L3 7Z" />
        <path d="M6 16h12" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </>
    ),
    link: (
      <>
        <path d="m9 15 6-6m-7 3-2 2a4 4 0 0 0 6 6l3-3m-3-9 2-2a4 4 0 0 1 6 6l-3 3" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10m-7 6h4" />
        <circle cx="8" cy="6" r="2" />
        <circle cx="15" cy="12" r="2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5" />
      </>
    ),
    audit: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" />
        <circle cx="18" cy="18" r="3" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16 12-12 4 4L8 20H4v-4ZM14 6l4 4" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h11l4 4v14H5V3ZM15 3v5h5M8 12h9m-9 4h6" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" />
      </>
    ),
    warning: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5m0 3h.01" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || paths.note}
    </svg>
  );
}
export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled,
  type = "button",
  title,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: string;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
      aria-label={
        title || (typeof children === "string" ? children : undefined)
      }
    >
      {icon && <Icon name={icon} size={17} />} {children}
    </button>
  );
}
export function Avatar({
  name,
  size = "normal",
}: {
  name: string;
  size?: string;
}) {
  const hash = [...name].reduce((n, x) => n + x.charCodeAt(0), 0);
  return (
    <span className={`avatar avatar-${size} av-${hash % 6}`}>
      {name
        .split(" ")
        .slice(0, 2)
        .map((x) => x[0])
        .join("")}
    </span>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Empty({
  title = "Todo al día",
  text = "No hay elementos que coincidan con esta vista.",
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span>
        <Icon name="quality" size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function SectionHead({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      <div className="section-actions">{children}</div>
    </div>
  );
}
export function Select({
  value,
  options,
  onChange,
  label,
  disabled = false,
}: {
  value: string;
  options: (string | { value: string; label: string })[];
  onChange: (s: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 150,
    height: 250,
  });
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = ref.current!.getBoundingClientRect();
      const height = Math.min(normalized.length * 38 + 12, 250);
      const below = window.innerHeight - rect.bottom - 12;
      setPosition({
        left: Math.min(
          rect.left,
          window.innerWidth - Math.max(rect.width, 150) - 10,
        ),
        top:
          below < Math.min(height, 150)
            ? Math.max(8, rect.top - height - 6)
            : rect.bottom + 6,
        width: Math.max(rect.width, 150),
        height,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, normalized.length]);
  return (
    <div
      className="custom-select"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
          ref.current?.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        className="select-trigger"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-controls={id}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              ref.current
                ?.querySelector<HTMLButtonElement>("[role=option]")
                ?.focus(),
            );
          }
        }}
      >
        {normalized.find((o) => o.value === value)?.label ||
          value ||
          "Seleccionar"}
        <Icon name="chevron" size={15} />
      </button>
      {open && (
        <div
          className="select-options"
          role="listbox"
          aria-label={label}
          id={id}
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            right: "auto",
            width: position.width,
            maxHeight: position.height,
          }}
        >
          {normalized.map((o, i) => (
            <button
              type="button"
              role="option"
              aria-selected={o.value === value}
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
                ref.current?.querySelector("button")?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const idx =
                    (i + (e.key === "ArrowDown" ? 1 : -1) + normalized.length) %
                    normalized.length;
                  ref.current
                    ?.querySelectorAll<HTMLButtonElement>("[role=option]")
                    [idx]?.focus();
                }
                if (e.key === "Home" || e.key === "End") {
                  e.preventDefault();
                  ref.current
                    ?.querySelectorAll<HTMLButtonElement>("[role=option]")
                    [e.key === "Home" ? 0 : normalized.length - 1]?.focus();
                }
              }}
            >
              {o.label}
              {o.value === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function DatePicker({
  value,
  onChange,
  label,
  required = false,
}: {
  value: string;
  onChange: (s: string) => void;
  label: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value?.slice(0, 7) || "2026-10");
  const ref = useRef<HTMLDivElement>(null);
  const [year, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, m - 1, 1));
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const offset = (start.getUTCDay() + 6) % 7;
  const move = (n: number) => {
    const d = new Date(Date.UTC(year, m - 1 + n, 1));
    setMonth(d.toISOString().slice(0, 7));
  };
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div
      className="date-picker"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <div className="date-input">
        <Icon name="calendar" size={17} />
        <input
          aria-label={label}
          placeholder="AAAA-MM-DD"
          value={value}
          required={required}
          pattern="\d{4}-\d{2}-\d{2}"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={`Abrir calendario: ${label}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Icon name="chevron" size={14} />
        </button>
      </div>
      {open && (
        <div className="calendar-popup">
          <div className="calendar-head">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => move(-1)}
            >
              <Icon name="left" size={16} />
            </button>
            <strong>
              {new Intl.DateTimeFormat("es", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(start)}
            </strong>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => move(1)}
            >
              <Icon name="right" size={16} />
            </button>
          </div>
          <div className="calendar-grid">
            {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={"e" + i} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, "0")}`;
              return (
                <button
                  type="button"
                  key={date}
                  aria-label={date}
                  className={value === date ? "selected" : ""}
                  onClick={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span />
    </button>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = () =>
      ref.current
        ?.querySelector<HTMLElement>('input, textarea, button, [tabindex="0"]')
        ?.focus();
    requestAnimationFrame(focus);
    const key = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== ref.current) return;
      if (e.key === "Escape" && !e.defaultPrevented) close.current();
      if (e.key === "Tab") {
        const items = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"], a[href]',
          ) || [],
        ).filter((el) => el.getClientRects().length);
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className={`modal-overlay ${drawer ? "drawer-overlay" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${wide ? "modal-wide" : ""} ${drawer ? "drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
      >
        <header className="modal-head">
          <h2 id={id}>{title}</h2>
          <Button
            variant="icon"
            title="Cerrar"
            icon="close"
            onClick={onClose}
          />
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
export interface Field {
  key: string;
  label: string;
  type?:
    | "textarea"
    | "number"
    | "email"
    | "date"
    | "select"
    | "checkbox"
    | "text";
  options?: (string | { value: string; label: string })[];
  required?: boolean;
  hint?: string;
  min?: number;
  max?: number;
}
export function EntityForm({
  fields,
  initial,
  submit,
  onCancel,
  submitLabel = "Guardar cambios",
  note,
  validate,
}: {
  fields: Field[];
  initial: Record<string, string>;
  submit: (v: Record<string, string>) => boolean | void;
  onCancel: () => void;
  submitLabel?: string;
  note?: string;
  validate?: (v: Record<string, string>) => string;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");
  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  const save = (e: FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !values[f.key]?.trim()) {
        setError(`Completá ${f.label.toLowerCase()}.`);
        return;
      }
      if (f.type === "date" && values[f.key] && !isISODate(values[f.key])) {
        setError(`Revisá la fecha de ${f.label.toLowerCase()}.`);
        return;
      }
      if (
        f.type === "number" &&
        values[f.key] &&
        (!Number.isFinite(Number(values[f.key])) ||
          Number(values[f.key]) < (f.min ?? 0) ||
          Number(values[f.key]) > (f.max ?? Infinity))
      ) {
        setError(`Revisá ${f.label.toLowerCase()}.`);
        return;
      }
    }
    const validation = validate?.(values);
    if (validation) {
      setError(validation);
      return;
    }
    if (submit(values) !== false) onCancel();
    else
      setError(
        "No se guardó el cambio. Revisá el aviso del almacenamiento o los permisos.",
      );
  };
  return (
    <form onSubmit={save} className="entity-form">
      {note && (
        <div className="form-note">
          <Icon name="note" size={18} />
          <span>{note}</span>
        </div>
      )}
      <div className="form-grid">
        {fields.map((f) => (
          <div
            className={`field ${f.type === "textarea" ? "full" : ""}`}
            key={f.key}
          >
            <label>
              {f.label}
              {f.required && <span className="required"> *</span>}
            </label>
            {f.type === "select" ? (
              <Select
                label={f.label}
                options={f.options || []}
                value={values[f.key] || ""}
                onChange={(v) => set(f.key, v)}
              />
            ) : f.type === "date" ? (
              <DatePicker
                label={f.label}
                value={values[f.key] || ""}
                onChange={(v) => set(f.key, v)}
                required={f.required}
              />
            ) : f.type === "textarea" ? (
              <textarea
                aria-label={f.label}
                required={f.required}
                value={values[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                rows={3}
              />
            ) : f.type === "checkbox" ? (
              <Toggle
                label={f.label}
                checked={values[f.key] === "true"}
                onChange={(v) => set(f.key, String(v))}
              />
            ) : (
              <input
                aria-label={f.label}
                required={f.required}
                type={f.type || "text"}
                min={f.min ?? 0}
                max={f.max}
                step={f.type === "number" ? "any" : undefined}
                value={values[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}{" "}
            {f.hint && <small>{f.hint}</small>}
          </div>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" icon="check">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon,
  onClick,
  tone = "",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  onClick?: () => void;
  tone?: string;
}) {
  return (
    <button className={`stat ${tone}`} onClick={onClick}>
      <div className="stat-top">
        <span>{label}</span>
        <Icon name={icon} size={18} />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </button>
  );
}
export function LineChart({
  data,
  label,
}: {
  data: { date: string; value: number }[];
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 420,
    h = 175,
    px = 20,
    py = 16;
  const points = data.map((d, i) => ({
    x: px + (i * (w - px * 2)) / Math.max(data.length - 1, 1),
    y: h - py - (d.value / max) * (h - py * 2),
  }));
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <div className="line-chart">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`${label}: ${data.map((d) => `${dateLabel(d.date)}, ${d.value}`).join("; ")}`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#4a9e88" stopOpacity=".2" />
            <stop offset="1" stopColor="#4a9e88" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((v) => (
          <line
            key={v}
            x1="15"
            x2="405"
            y1={py + v * (h - py * 2)}
            y2={py + v * (h - py * 2)}
            stroke="#e9eded"
            strokeDasharray="3 5"
          />
        ))}
        {points.length > 0 && (
          <path
            d={`${path} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`}
            fill={`url(#${id})`}
          />
        )}
        <path
          className="chart-path"
          d={path}
          fill="none"
          stroke="#2e806b"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <circle cx={p.x} cy={p.y} r="13" fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 3}
              fill="#2e806b"
              stroke="white"
              strokeWidth="2"
            />
            {hover === i && (
              <g>
                <rect
                  x={Math.min(Math.max(p.x - 34, 0), w - 70)}
                  y={Math.max(p.y - 36, 0)}
                  width="70"
                  height="25"
                  rx="6"
                  fill="#152f2c"
                />
                <text
                  x={Math.min(Math.max(p.x, 34), w - 36)}
                  y={Math.max(p.y - 19, 17)}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                >
                  {data[i].value} enlaces
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-axis">
        {data.map((d) => (
          <span key={d.date}>
            {d.date.slice(8)}/{d.date.slice(5, 7)}
          </span>
        ))}
      </div>
    </div>
  );
}
export function Bars({
  data,
  currency = false,
}: {
  data: { label: string; value: number; tone?: string }[];
  currency?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bars">
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <div>
            <span>{d.label}</span>
            <strong>{currency ? money(d.value) : d.value}</strong>
          </div>
          <div className="bar-track">
            <span
              style={{ width: `${(d.value / max) * 100}%` }}
              className={d.tone || ""}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
export function Donut({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((n, x) => n + x.value, 0);
  let offset = 0;
  return (
    <div className="donut-layout">
      <div className="donut">
        <svg
          viewBox="0 0 160 160"
          role="img"
          aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}
        >
          <circle
            cx="80"
            cy="80"
            r="61"
            fill="none"
            stroke="#edf0ef"
            strokeWidth="15"
          />
          {data.map((d) => {
            const length = total ? (d.value / total) * 383.27 : 0;
            const node = (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r="61"
                fill="none"
                stroke={d.color}
                strokeWidth="15"
                strokeDasharray={`${Math.max(0, length - 3)} ${383.27}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 80 80)"
              />
            );
            offset += length;
            return node;
          })}
        </svg>
        <div>
          <strong>{total}</strong>
          <span>clientes</span>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d) => (
          <div key={d.label}>
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.label}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
