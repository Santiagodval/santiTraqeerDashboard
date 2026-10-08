import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  Bars,
  Button,
  DatePicker,
  Donut,
  Empty,
  Icon,
  LineChart,
  Modal,
  SectionHead,
  Select,
  Stat,
  Toggle,
} from "./components";
import type { Store, Task } from "./model";
import {
  activeTask,
  addDays,
  ageBucket,
  categories,
  caseStatuses,
  completeTask,
  dateLabel,
  daysBetween,
  healthLabels,
  isISODate,
  leadStages,
  money,
  overdue,
  owners,
  priorityLabels,
  promiseStatus,
  qualityFindings,
  taskScore,
  taskStatuses,
  uid,
  validStore,
} from "./model";
import { StoreProvider, useStore } from "./store";
import { createSeed } from "./seed";
import { useForms } from "./forms";
import Customer360, { Timeline } from "./Customer360";

const navigation = [
  {
    key: "overview",
    label: "Mi workspace",
    icon: "overview",
    group: "OPERACIONES",
  },
  { key: "customers", label: "Clientes", icon: "customers" },
  { key: "tasks", label: "Tareas", icon: "tasks" },
  { key: "cases", label: "Casos", icon: "cases" },
  { key: "payments", label: "Pagos", icon: "payments" },
  { key: "escalations", label: "Escalaciones", icon: "flag" },
  { key: "outreach", label: "Outreach", icon: "outreach", group: "RELACIONES" },
  { key: "communication", label: "Comunicaciones", icon: "communication" },
  {
    key: "quality",
    label: "Salud del CRM",
    icon: "quality",
    group: "INTELIGENCIA",
  },
  { key: "analytics", label: "Analytics", icon: "analytics" },
  { key: "playbooks", label: "Playbooks", icon: "playbooks" },
  { key: "audit", label: "Historial", icon: "audit" },
  { key: "settings", label: "Configuración", icon: "settings" },
];
const titles: Record<string, { title: string; text: string }> = {
  overview: {
    title: "Un buen día empieza con claridad.",
    text: "Tu operación, tus prioridades. Un siguiente paso a la vez.",
  },
  customers: {
    title: "Cada relación, en contexto.",
    text: "Salud, compromisos y próximos pasos de tus creadores.",
  },
  tasks: {
    title: "Nada importante se queda atrás.",
    text: "Dale un responsable y una fecha a cada compromiso.",
  },
  cases: {
    title: "Problemas abiertos. Pasos concretos.",
    text: "Investigaciones, evidencia y actualizaciones para tus clientes.",
  },
  payments: {
    title: "Cobros con contexto.",
    text: "Obligaciones, intentos de contacto y fechas acordadas.",
  },
  escalations: {
    title: "El equipo correcto, a tiempo.",
    text: "Solicitudes internas, responsables y próximas actualizaciones.",
  },
  outreach: {
    title: "Primero, una buena conversación.",
    text: "Prospectos, objeciones y referidos que merecen seguimiento.",
  },
  communication: {
    title: "El contexto detrás de cada mensaje.",
    text: "Conversaciones registradas, notas y borradores de respuesta.",
  },
  quality: {
    title: "Datos en los que podés confiar.",
    text: "Detectá inconsistencias. Revisá el origen. Corregí con criterio.",
  },
  analytics: {
    title: "Señales que ayudan a decidir.",
    text: "Métricas operativas calculadas sobre tus registros locales.",
  },
  playbooks: {
    title: "Claridad antes de prometer.",
    text: "Guías de práctica y políticas que necesitan confirmación.",
  },
  audit: {
    title: "Cada cambio tiene una historia.",
    text: "Quién hizo qué, cuándo y sobre qué registro.",
  },
  settings: {
    title: "Un workspace a tu medida.",
    text: "Fecha de práctica, reglas, visibilidad y datos locales.",
  },
};
const toneHealth = (h: string) => h;
function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Workspace() {
  const {
    state: s,
    mutate,
    error,
    reload,
    replace,
    recover,
    corruptRaw,
  } = useStore();
  const [view, setView] = useState(() =>
    navigation.some((n) => n.key === location.hash.slice(1))
      ? location.hash.slice(1)
      : "overview",
  );
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [confirm, setConfirm] = useState<
    "reset" | "export" | "recover" | "import" | null
  >(null);
  const [pendingImport, setPendingImport] = useState<Store | null>(null);
  const [conversation, setConversation] = useState("TQ-1002");
  const [commSearch, setCommSearch] = useState("");
  const [commChannel, setCommChannel] = useState("Email");
  const [draft, setDraft] = useState("");
  const [draftMode, setDraftMode] = useState("draft");
  const [nextAction, setNextAction] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [book, setBook] = useState("PB-001");
  const [auditSelection, setAuditSelection] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const notify = (message: string) => setToast(message);
  const forms = useForms(notify);
  const today = s.config.referenceDate;
  const go = (target: string) => {
    location.hash = target;
    setView(target);
    setMobile(false);
    setQ("");
    setFilters({});
    setShowFilters(false);
  };
  useEffect(() => {
    const hash = () => {
      const next = location.hash.slice(1);
      if (navigation.some((n) => n.key === next)) {
        setView(next);
        setQ("");
        setFilters({});
      }
    };
    window.addEventListener("hashchange", hash);
    return () => window.removeEventListener("hashchange", hash);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const getCustomer = (id: string) => s.customers.find((c) => c.id === id);
  const customerName = (id: string) =>
    getCustomer(id)?.name ||
    s.leads.find((l) => l.id === id)?.name ||
    "Acción interna";
  const customerButton = (id: string) => {
    const c = getCustomer(id);
    return c ? (
      <button className="customer-link" onClick={() => setSelectedCustomer(id)}>
        <Avatar name={c.name} />
        <span>
          <strong>
            {c.name}
            {c.vip && <Icon name="vip" size={13} />}
          </strong>
          <small>
            {c.id} · {c.platforms[0]}
          </small>
        </span>
      </button>
    ) : (
      <span className="muted">Sin cliente asociado</span>
    );
  };
  const openTasks = s.tasks.filter(activeTask);
  const dueTasks = openTasks.filter((t) => t.due <= today);
  const overdueTasks = dueTasks.filter((t) => t.due < today);
  const openCases = s.cases.filter((c) => c.status !== "Resuelto");
  const pendingPayments = s.payments.filter((p) => p.status === "Pendiente");
  const latePayments = pendingPayments.filter((p) => overdue(p.due, today));
  const totalOverdue = latePayments.reduce((n, p) => n + p.amount, 0);
  const atRisk = s.customers.filter((c) =>
    ["risk", "churn"].includes(c.health),
  );
  const activeEscalations = s.escalations.filter((e) => e.status !== "Cerrada");
  const findings = qualityFindings(s);
  const missedPromises = pendingPayments.filter(
    (p) => promiseStatus(p, today) === "Incumplido",
  );
  const outreachDue = s.leads.filter(
    (l) =>
      l.nextContact &&
      l.nextContact <= today &&
      !["No contactar", "Convertido", "No interesado"].includes(l.stage),
  );
  const rankedTasks = [...dueTasks].sort(
    (a, b) => taskScore(b, s) - taskScore(a, s),
  );
  const healthData = [
    {
      label: "Saludable",
      value: s.customers.filter((c) => c.health === "healthy").length,
      color: "#3b8971",
    },
    {
      label: "En observación",
      value: s.customers.filter((c) => c.health === "watch").length,
      color: "#b9c8c0",
    },
    {
      label: "En riesgo",
      value: s.customers.filter((c) => c.health === "risk").length,
      color: "#dcb778",
    },
    {
      label: "Riesgo de baja",
      value: s.customers.filter((c) => c.health === "churn").length,
      color: "#bc756a",
    },
  ];
  const aging = [
    "Al día",
    "1–7 días",
    "8–30 días",
    "31–60 días",
    "61–90 días",
    "90+ días",
  ].map((label) => ({
    label,
    value: pendingPayments
      .filter((p) => ageBucket(daysBetween(p.due, today)) === label)
      .reduce((n, p) => n + p.amount, 0),
  }));
  const removalData = Array.from(
    { length: Math.min(Number(today.slice(8)), 14) },
    (_, i) => {
      const date = addDays(today, i - Math.min(Number(today.slice(8)), 14) + 1);
      return {
        date,
        value: s.removals
          .filter((r) => r.date === date)
          .reduce((n, r) => n + r.count, 0),
      };
    },
  );
  const matchesText = (v: unknown) =>
    JSON.stringify(v).toLowerCase().includes(q.toLowerCase());
  const filter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const fMatch = (key: string, value: string) =>
    !filters[key] || filters[key] === "Todos" || filters[key] === value;
  const customerMatch = (id: string) => {
    const c = getCustomer(id);
    return (
      (!filters.health ||
        filters.health === "Todos" ||
        c?.health === filters.health) &&
      (!filters.vip ||
        filters.vip === "Todos" ||
        c?.vip === (filters.vip === "VIP")) &&
      (!filters.platform ||
        filters.platform === "Todos" ||
        c?.platforms.includes(filters.platform))
    );
  };
  const dateMatch = (d: string) =>
    !filters.date ||
    filters.date === "Todos" ||
    (filters.date === "Hoy"
      ? d === today
      : filters.date === "Vencido"
        ? overdue(d, today)
        : d > today);
  const relatedMatch = (t: Task) =>
    !filters.related ||
    filters.related === "Todos" ||
    (filters.related === "Caso"
      ? !!t.caseId
      : filters.related === "Pago"
        ? !!t.paymentId
        : !!t.leadId);
  function statusTask(t: Task, status: string) {
    forms.change(`Tarea: ${status}`, t.id, (state) => {
      const updated =
        status === "Completada"
          ? completeTask(state, t.id)
          : {
              ...state,
              tasks: state.tasks.map((x) =>
                x.id === t.id ? { ...x, status } : x,
              ),
            };
      const next = updated.tasks
        .filter((x) => x.customerId === t.customerId && activeTask(x))
        .sort((a, b) => a.due.localeCompare(b.due))[0];
      return {
        ...updated,
        customers: updated.customers.map((c) =>
          c.id === t.customerId && c.nextAction === t.title
            ? { ...c, nextAction: next?.title || "", nextDate: next?.due || "" }
            : c,
        ),
      };
    });
  }
  const communicate = (id: string) => {
    setSelectedCustomer("");
    setConversation(id);
    setDraft("");
    go("communication");
  };
  const download = (data: string, name: string, type = "application/json") => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const saveConversation = () => {
    if (!draft.trim() || !getCustomer(conversation)) {
      notify("Escribí el contenido antes de guardar.");
      return;
    }
    if (
      (nextAction && !nextDate) ||
      (!nextAction && nextDate) ||
      (nextDate && (!isISODate(nextDate) || nextDate < today))
    ) {
      notify(
        "Agregá una acción y una fecha válida de seguimiento, hoy o futura.",
      );
      return;
    }
    const ok = forms.change(
      draftMode === "draft" ? "Borrador guardado" : "Comunicación registrada",
      conversation,
      (state) => ({
        ...state,
        interactions: [
          ...state.interactions,
          {
            id: uid("INT"),
            customerId: conversation,
            channel: draftMode === "note" ? "Internal note" : commChannel,
            kind: draftMode as "draft" | "contact" | "incoming" | "note",
            text: draft.trim(),
            author:
              draftMode === "incoming"
                ? customerName(conversation)
                : "Santiago Valdez",
            date: `${today}T${new Date().toISOString().slice(11)}`,
          },
        ],
        customers: state.customers.map((c) =>
          c.id === conversation
            ? {
                ...c,
                lastContact: ["contact", "incoming"].includes(draftMode)
                  ? today
                  : c.lastContact,
                ...(nextAction ? { nextAction, nextDate } : {}),
              }
            : c,
        ),
        tasks: nextAction
          ? [
              ...state.tasks,
              {
                id: uid("TASK"),
                customerId: conversation,
                title: nextAction,
                type: "Seguimiento",
                priority: "medium",
                owner: owners[0],
                due: nextDate,
                status: "Por hacer",
                caseId: "",
                paymentId: "",
                leadId: "",
                recurrence: 0,
              },
            ]
          : state.tasks,
      }),
    );
    if (ok) {
      setDraft("");
      setNextAction("");
      setNextDate("");
    }
  };
  const alerts = [
    ...(s.config.alerts.vip
      ? s.customers
          .filter((c) => c.vip && c.health === "churn")
          .map((c) => ({
            id: c.id,
            title: "VIP con intención de baja",
            text: `${c.name} · Dar una actualización concreta`,
            customerId: c.id,
            route: "customers",
          }))
      : []),
    ...(s.config.alerts.overdue
      ? overdueTasks.map((t) => ({
          id: t.id,
          title: "Acción vencida",
          text: `${customerName(t.customerId || t.leadId)} · ${t.title}`,
          customerId: t.customerId,
          route: "tasks",
        }))
      : []),
    ...(s.config.alerts.promise
      ? missedPromises.map((p) => ({
          id: p.id,
          title: "Compromiso de pago incumplido",
          text: `${customerName(p.customerId)} · ${money(p.amount)} · ${dateLabel(p.promiseDate)}`,
          customerId: p.customerId,
          route: "payments",
        }))
      : []),
    ...(s.config.alerts.recurrence
      ? s.incidents
          .filter(
            (i) =>
              i.recurrence > 1 &&
              s.cases.find((c) => c.id === i.caseId)?.status !== "Resuelto",
          )
          .map((i) => ({
            id: i.id,
            title: "Incidente recurrente",
            text: `${customerName(i.customerId)} · ${i.recurrence} reportes`,
            customerId: i.customerId,
            route: "cases",
          }))
      : []),
    ...(s.config.alerts.quality && findings.length
      ? [
          {
            id: "quality",
            title: "CRM requiere revisión",
            text: `${findings.length} hallazgos pendientes`,
            customerId: "",
            route: "quality",
          },
        ]
      : []),
    ...(s.config.alerts.inactivity
      ? s.customers
          .filter(
            (c) =>
              c.lastContact &&
              daysBetween(c.lastContact, today) > s.config.inactiveDays,
          )
          .map((c) => ({
            id: `idle-${c.id}`,
            title: "Sin contacto reciente",
            text: `${c.name} · más de ${s.config.inactiveDays} días`,
            customerId: c.id,
            route: "customers",
          }))
      : []),
  ];
  const filterBar = (
    statuses: string[] = [],
    extra: {
      key: string;
      label: string;
      options: (string | { value: string; label: string })[];
    }[] = [],
  ) => (
    <div className="list-controls">
      <div className="search-field">
        <Icon name="search" size={18} />
        <input
          aria-label="Buscar en esta vista"
          placeholder="Buscar nombre, ID o referencia…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button aria-label="Limpiar búsqueda" onClick={() => setQ("")}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      {statuses.length > 0 && (
        <Select
          label="Filtrar estado"
          value={filters.status || "Todos"}
          options={["Todos", ...statuses]}
          onChange={(v) => filter("status", v)}
        />
      )}
      <Button
        variant={showFilters ? "subtle" : "secondary"}
        icon="filter"
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtros
        {Object.values(filters).filter((v) => v && v !== "Todos").length >
          0 && (
          <span className="count-dot">
            {Object.values(filters).filter((v) => v && v !== "Todos").length}
          </span>
        )}
      </Button>
      {showFilters && (
        <div className="filter-panel">
          <label>
            Responsable
            <Select
              label="Filtrar responsable"
              value={filters.owner || "Todos"}
              options={["Todos", ...owners]}
              onChange={(v) => filter("owner", v)}
            />
          </label>
          {extra.map((x) => (
            <label key={x.key}>
              {x.label}
              <Select
                label={`Filtrar ${x.label}`}
                value={filters[x.key] || "Todos"}
                options={[{ value: "Todos", label: "Todos" }, ...x.options]}
                onChange={(v) => filter(x.key, v)}
              />
            </label>
          ))}
          <Button variant="ghost" onClick={() => setFilters({})}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
  const priorityFilter = {
    key: "priority",
    label: "Prioridad",
    options: Object.entries(priorityLabels).map(([value, label]) => ({
      value,
      label,
    })),
  };
  const dateFilter = {
    key: "date",
    label: "Fecha",
    options: ["Hoy", "Vencido", "Futuro"],
  };
  const healthFilter = {
    key: "health",
    label: "Salud",
    options: Object.entries(healthLabels).map(([value, label]) => ({
      value,
      label,
    })),
  };
  const platformFilter = {
    key: "platform",
    label: "Plataforma",
    options: [...new Set(s.customers.flatMap((c) => c.platforms))],
  };

  return (
    <div className="app-shell">
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a className="brand" href="#overview" onClick={() => go("overview")}>
          <span className="brand-mark">
            t<span />
          </span>
          <span>
            traqeer<span className="brand-period">.</span>
          </span>
        </a>
        <button className="workspace-switch" onClick={() => go("settings")}>
          <span className="workspace-symbol">
            <Icon name="quality" size={20} />
          </span>
          <span>
            <strong>Creator Operations</strong>
            <small>Workspace de práctica</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <nav aria-label="Navegación principal">
          {navigation.map((n) => (
            <div key={n.key}>
              {n.group && <span className="nav-group">{n.group}</span>}
              <button
                className={`nav-item ${view === n.key ? "active" : ""}`}
                onClick={() => go(n.key)}
                aria-current={view === n.key ? "page" : undefined}
              >
                <Icon name={n.icon} size={19} />
                <span>{n.label}</span>
                {n.key === "tasks" && overdueTasks.length > 0 && (
                  <b className="nav-count">{overdueTasks.length}</b>
                )}
                {n.key === "quality" && findings.length > 0 && (
                  <span className="nav-warning" />
                )}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-status">
            <Icon name="lock" size={15} />
            <span>Datos ficticios · localStorage</span>
          </div>
          <button className="user-menu" onClick={() => go("settings")}>
            <Avatar name="Santiago Valdez" />
            <span>
              <strong>Santiago Valdez</strong>
              <small>
                {s.config.role === "viewer"
                  ? "Consulta"
                  : s.config.role === "supervisor"
                    ? "Supervisión"
                    : "Customer Success"}{" "}
                · simulación
              </small>
            </span>
            <Icon name="settings" size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-path">
            <button
              className="mobile-menu"
              aria-label="Abrir navegación"
              onClick={() => setMobile(!mobile)}
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <Icon name="right" size={13} />
            <strong>{navigation.find((n) => n.key === view)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={17} />
              <span>Buscar en Traqeer</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="top-divider" />
            <button
              className="notification-button"
              aria-label={`Abrir alertas, ${alerts.length} pendientes`}
              onClick={() => setAlertsOpen(true)}
            >
              <Icon name="bell" size={21} />
              {alerts.length > 0 && <span />}
            </button>
            <Avatar name="Santiago Valdez" size="small" />
          </div>
        </header>
        {error && (
          <div className="storage-error" role="alert">
            <Icon name="warning" />
            <span>{error}</span>
            <Button variant="secondary" onClick={reload}>
              Revisar de nuevo
            </Button>
            <Button variant="ghost" onClick={() => go("settings")}>
              Recuperación
            </Button>
          </div>
        )}
        <main className="main-content" key={view}>
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {view === "overview" ? "HOLA, SANTIAGO" : "CUSTOMER OPERATIONS"}
              </span>
              <h1>{titles[view]?.title}</h1>
              <p>{titles[view]?.text}</p>
            </div>
            <div className="heading-actions">
              <button
                className="date-chip"
                onClick={() => go("settings")}
                title="Cambiar fecha de práctica"
              >
                <Icon name="calendar" size={16} />
                {new Intl.DateTimeFormat("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(today + "T12:00:00Z"))}
                <Icon name="chevron" size={13} />
              </button>
              <Button
                icon="plus"
                onClick={() => forms.task()}
                disabled={forms.readonly}
              >
                Nueva acción
              </Button>
            </div>
          </div>
          {view === "overview" && (
            <>
              <div className="overview-context">
                <Badge tone="healthy">
                  <Icon name="quality" size={13} /> Modo práctica
                </Badge>
                <span>Datos ficticios del assessment</span>
                <span className="context-separator" />
                <span>Prioridad = riesgo + valor + urgencia</span>
              </div>
              <div className="stats-grid">
                <Stat
                  label="Requieren tu atención"
                  value={dueTasks.length}
                  detail={`${overdueTasks.length} vencidas · ${dueTasks.length - overdueTasks.length} para hoy`}
                  icon="clock"
                  onClick={() => go("tasks")}
                />
                <Stat
                  label="Clientes en riesgo"
                  value={atRisk.length}
                  detail={`${s.customers.filter((c) => c.health === "churn").length} con riesgo de baja`}
                  icon="customers"
                  onClick={() => go("customers")}
                />
                <Stat
                  label="Saldo vencido"
                  value={money(totalOverdue)}
                  detail={`${new Set(latePayments.map((p) => p.customerId)).size} clientes · ${missedPromises.length} compromiso incumplido`}
                  icon="payments"
                  onClick={() => go("payments")}
                />
                <Stat
                  label="Casos abiertos"
                  value={openCases.length}
                  detail={`${openCases.filter((c) => c.priority === "critical").length} crítico · ${activeEscalations.length} escalaciones`}
                  icon="cases"
                  onClick={() => go("cases")}
                />
              </div>
              <div className="overview-grid">
                <section className="panel today-panel">
                  <SectionHead
                    title="Tu foco de hoy"
                    eyebrow="LO IMPORTANTE, PRIMERO"
                  >
                    <Badge tone="neutral">{dueTasks.length} acciones</Badge>
                    <Button
                      variant="icon"
                      title="Ver todas las tareas"
                      icon="right"
                      onClick={() => go("tasks")}
                    />
                  </SectionHead>
                  {rankedTasks.length > 0 && (
                    <div className="focus-card">
                      <div className="focus-top">
                        <span>
                          <Icon name="sparkle" size={15} /> PRIORIDAD PRINCIPAL
                        </span>
                        <Badge tone="critical">
                          {priorityLabels[rankedTasks[0].priority]}
                        </Badge>
                      </div>
                      <div className="focus-person">
                        <Avatar
                          name={customerName(
                            rankedTasks[0].customerId || rankedTasks[0].leadId,
                          )}
                        />
                        <div>
                          <strong>
                            {customerName(
                              rankedTasks[0].customerId ||
                                rankedTasks[0].leadId,
                            )}
                          </strong>
                          <span>
                            {getCustomer(rankedTasks[0].customerId)?.vip
                              ? "VIP · "
                              : ""}
                            {getCustomer(rankedTasks[0].customerId)?.health ===
                            "churn"
                              ? "Intención de baja"
                              : rankedTasks[0].type}
                          </span>
                        </div>
                      </div>
                      <h3>{rankedTasks[0].title}</h3>
                      <p>
                        {getCustomer(rankedTasks[0].customerId)?.health ===
                        "churn"
                          ? "Reconocé la frustración, revisá la evidencia y confirmá la próxima actualización."
                          : "Revisá el contexto y registrá una próxima acción concreta."}
                      </p>
                      <div className="focus-bottom">
                        <span>
                          <Icon name="clock" size={14} />
                          {overdue(rankedTasks[0].due, today)
                            ? "Vencida"
                            : "Para hoy"}{" "}
                          · {dateLabel(rankedTasks[0].due)}
                        </span>
                        <Button
                          variant="light"
                          onClick={() =>
                            rankedTasks[0].customerId
                              ? setSelectedCustomer(rankedTasks[0].customerId)
                              : forms.task(rankedTasks[0])
                          }
                        >
                          Revisar contexto <Icon name="right" size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="today-list">
                    {rankedTasks.slice(1, 5).map((t) => (
                      <div className="today-row" key={t.id}>
                        <button
                          className="task-check"
                          aria-label={`Completar ${t.title}`}
                          disabled={forms.readonly}
                          onClick={() => statusTask(t, "Completada")}
                        >
                          <Icon name="check" size={13} />
                        </button>
                        <button
                          className="today-content"
                          onClick={() =>
                            t.customerId
                              ? setSelectedCustomer(t.customerId)
                              : forms.task(t)
                          }
                        >
                          <strong>{t.title}</strong>
                          <span>
                            {customerName(t.customerId || t.leadId)} <i />{" "}
                            {t.type}
                          </span>
                        </button>
                        <div className="today-meta">
                          <Badge tone={t.priority}>
                            {priorityLabels[t.priority]}
                          </Badge>
                          <span
                            className={
                              overdue(t.due, today) ? "overdue-text" : ""
                            }
                          >
                            {overdue(t.due, today) ? "Vencida · " : ""}
                            {dateLabel(t.due)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {rankedTasks.length === 0 && (
                    <Empty
                      title="Tu foco está al día"
                      text="No hay tareas abiertas para hoy o fechas anteriores."
                    />
                  )}
                  <button
                    className="panel-footer-link"
                    onClick={() => go("tasks")}
                  >
                    Ver todas las acciones <Icon name="right" size={15} />
                  </button>
                </section>
                <div className="overview-right">
                  <section className="panel activity-panel">
                    <SectionHead title="Protección en actividad">
                      <Badge tone="healthy">
                        {new Intl.DateTimeFormat("es", {
                          month: "long",
                          timeZone: "UTC",
                        }).format(new Date(today + "T12:00:00Z"))}{" "}
                        · ejemplo
                      </Badge>
                    </SectionHead>
                    <div className="activity-value">
                      <strong>
                        {s.removals
                          .filter(
                            (r) =>
                              r.date.slice(0, 7) === today.slice(0, 7) &&
                              r.date <= today,
                          )
                          .reduce((n, r) => n + r.count, 0)}
                      </strong>
                      <span>enlaces removidos registrados</span>
                    </div>
                    <LineChart
                      data={removalData}
                      label="Remociones registradas"
                    />
                    <p className="chart-footnote">
                      Actividad registrada; los incidentes recurrentes siguen
                      abiertos.
                    </p>
                  </section>
                  <section className="panel health-panel">
                    <SectionHead title="Salud de las relaciones">
                      <Button
                        variant="icon"
                        title="Ver clientes"
                        icon="right"
                        onClick={() => go("customers")}
                      />
                    </SectionHead>
                    <Donut data={healthData} />
                  </section>
                </div>
              </div>
              <div className="bottom-grid">
                <section className="panel">
                  <SectionHead title="Compromisos de pago">
                    <Icon name="payments" size={19} />
                  </SectionHead>
                  {pendingPayments
                    .filter((p) => p.promiseDate)
                    .map((p) => (
                      <button
                        className="commitment-row"
                        key={p.id}
                        onClick={() => setSelectedCustomer(p.customerId)}
                      >
                        <Avatar name={customerName(p.customerId)} />
                        <span>
                          <strong>{customerName(p.customerId)}</strong>
                          <small>
                            Prometido para {dateLabel(p.promiseDate)}
                          </small>
                        </span>
                        <div>
                          <strong>{money(p.amount)}</strong>
                          <Badge
                            tone={
                              promiseStatus(p, today) === "Incumplido"
                                ? "high"
                                : "healthy"
                            }
                          >
                            {promiseStatus(p, today)}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  {!pendingPayments.some((p) => p.promiseDate) && (
                    <p className="muted small">
                      No hay compromisos con fecha acordada.
                    </p>
                  )}
                  {pendingPayments.filter(
                    (p) => p.customerId === "TQ-1001" && !p.promiseDate,
                  ).length > 0 && (
                    <div className="quiet-row">
                      <span>María: intención sin fecha concreta</span>
                      <strong>
                        {money(
                          pendingPayments
                            .filter(
                              (p) =>
                                p.customerId === "TQ-1001" && !p.promiseDate,
                            )
                            .reduce((n, p) => n + p.amount, 0),
                        )}
                      </strong>
                    </div>
                  )}
                  <button
                    className="panel-footer-link"
                    onClick={() => go("payments")}
                  >
                    Revisar cartera <Icon name="right" size={15} />
                  </button>
                </section>
                <section className="panel">
                  <SectionHead title="En manos del equipo">
                    <Badge>{activeEscalations.length} abiertas</Badge>
                  </SectionHead>
                  {activeEscalations.slice(0, 2).map((e) => (
                    <button
                      className="escalation-preview"
                      key={e.id}
                      onClick={() => forms.escalation(e)}
                    >
                      <span className={`priority-line ${e.priority}`} />
                      <div>
                        <strong>{customerName(e.customerId)}</strong>
                        <span>{e.owner}</span>
                        <small>
                          {e.status} · próxima actualización{" "}
                          {dateLabel(e.nextUpdate)}
                        </small>
                      </div>
                      <Icon name="right" size={16} />
                    </button>
                  ))}
                  <button
                    className="panel-footer-link"
                    onClick={() => go("escalations")}
                  >
                    Revisar escalaciones <Icon name="right" size={15} />
                  </button>
                </section>
                <section className="panel quality-preview">
                  <SectionHead title="CRM bajo revisión">
                    <Icon name="quality" size={19} />
                  </SectionHead>
                  <div className="quality-value">
                    <strong>
                      {new Set(findings.map((f) => f.recordId)).size}
                    </strong>
                    <span>
                      registros requieren
                      <br />
                      revisión humana
                    </span>
                  </div>
                  <div className="quality-tags">
                    <Badge tone="high">
                      {findings.filter((f) => f.type === "Duplicado").length}{" "}
                      posibles duplicados
                    </Badge>
                    <Badge>
                      {
                        findings.filter((f) => f.type === "Fecha inválida")
                          .length
                      }{" "}
                      fechas inválidas
                    </Badge>
                  </div>
                  <button
                    className="panel-footer-link"
                    onClick={() => go("quality")}
                  >
                    Revisar datos <Icon name="right" size={15} />
                  </button>
                </section>
              </div>
              <div className="outreach-ribbon">
                <span className="ribbon-icon">
                  <Icon name="outreach" size={21} />
                </span>
                <div>
                  <strong>La próxima conversación puede empezar hoy.</strong>
                  <span>
                    {outreachDue.length} prospectos con seguimiento pendiente ·{" "}
                    {s.leads.filter((l) => l.stage === "Interesado").length}{" "}
                    interesados
                  </span>
                </div>
                <Button variant="secondary" onClick={() => go("outreach")}>
                  Abrir outreach
                </Button>
              </div>
            </>
          )}

          {view === "customers" && (
            <>
              <div className="summary-tabs">
                <button
                  className={!filters.health && !filters.vip ? "active" : ""}
                  onClick={() => setFilters({})}
                >
                  Todos <b>{s.customers.length}</b>
                </button>
                <button
                  onClick={() => filter("health", "churn")}
                  className={filters.health === "churn" ? "active" : ""}
                >
                  Riesgo de baja{" "}
                  <b>
                    {s.customers.filter((c) => c.health === "churn").length}
                  </b>
                </button>
                <button
                  onClick={() => filter("vip", "VIP")}
                  className={filters.vip === "VIP" ? "active" : ""}
                >
                  VIP <b>{s.customers.filter((c) => c.vip).length}</b>
                </button>
                <div className="spacer" />
                <Button
                  icon="plus"
                  disabled={forms.readonly}
                  onClick={() => forms.customer()}
                >
                  Nuevo cliente
                </Button>
              </div>
              <section className="panel table-panel">
                {filterBar(
                  ["Activo", "En conversación", "Dormido", "Ganado", "Impago"],
                  [
                    healthFilter,
                    platformFilter,
                    { key: "vip", label: "Valor", options: ["VIP", "Regular"] },
                    {
                      key: "payment",
                      label: "Pago",
                      options: ["Pendiente", "Sin saldo pendiente"],
                    },
                    dateFilter,
                  ],
                )}
                <Table
                  headers={[
                    "Cliente",
                    "Relación",
                    "Valor mensual",
                    "Saldo pendiente",
                    "Próxima acción",
                    "Responsable",
                    "",
                  ]}
                >
                  {s.customers
                    .filter(
                      (c) =>
                        matchesText(c) &&
                        customerMatch(c.id) &&
                        fMatch("status", c.stage) &&
                        fMatch("owner", c.owner) &&
                        dateMatch(c.nextDate) &&
                        fMatch(
                          "payment",
                          pendingPayments.some((p) => p.customerId === c.id)
                            ? "Pendiente"
                            : "Sin saldo pendiente",
                        ),
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>{customerButton(c.id)}</td>
                        <td>
                          <Badge tone={toneHealth(c.health)}>
                            {healthLabels[c.health]}
                          </Badge>
                          <small className="cell-sub">{c.stage}</small>
                        </td>
                        <td className="number-cell">
                          {money(c.subscription.monthly)}
                        </td>
                        <td className="number-cell">
                          {money(
                            pendingPayments
                              .filter((p) => p.customerId === c.id)
                              .reduce((n, p) => n + p.amount, 0),
                          )}
                        </td>
                        <td>
                          <span className="cell-action">
                            {c.nextAction || "Sin acción pendiente"}
                          </span>
                          <small
                            className={`cell-sub ${overdue(c.nextDate, today) ? "overdue-text" : ""}`}
                          >
                            {dateLabel(c.nextDate)}
                          </small>
                        </td>
                        <td>
                          <span className="owner-name">{c.owner}</span>
                        </td>
                        <td>
                          <Button
                            variant="icon"
                            title={`Abrir ${c.name}`}
                            icon="right"
                            onClick={() => setSelectedCustomer(c.id)}
                          />
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.customers.some(
                  (c) =>
                    matchesText(c) &&
                    customerMatch(c.id) &&
                    fMatch("status", c.stage) &&
                    fMatch("owner", c.owner) &&
                    dateMatch(c.nextDate) &&
                    fMatch(
                      "payment",
                      pendingPayments.some((p) => p.customerId === c.id)
                        ? "Pendiente"
                        : "Sin saldo pendiente",
                    ),
                ) && (
                  <Empty
                    title="No encontramos clientes"
                    text="Probá otro nombre o limpiá los filtros."
                  />
                )}
              </section>
            </>
          )}

          {view === "tasks" && (
            <>
              <div className="stats-grid three">
                <Stat
                  label="Para hoy"
                  value={dueTasks.length - overdueTasks.length}
                  detail="Acciones abiertas con fecha de hoy"
                  icon="calendar"
                />
                <Stat
                  label="Vencidas"
                  value={overdueTasks.length}
                  detail="Compromisos que necesitan una actualización"
                  icon="clock"
                />
                <Stat
                  label="Completadas"
                  value={
                    s.tasks.filter((t) => t.status === "Completada").length
                  }
                  detail="Historial de acciones realizadas"
                  icon="check"
                />
              </div>
              <section className="panel table-panel">
                {filterBar(taskStatuses, [
                  priorityFilter,
                  dateFilter,
                  healthFilter,
                  {
                    key: "related",
                    label: "Relacionado",
                    options: ["Caso", "Pago", "Prospecto"],
                  },
                ])}
                <Table
                  headers={[
                    "",
                    "Acción",
                    "Cliente / prospecto",
                    "Prioridad",
                    "Fecha límite",
                    "Responsable",
                    "Estado",
                    "",
                  ]}
                >
                  {[...s.tasks]
                    .sort(
                      (a, b) =>
                        Number(activeTask(b)) - Number(activeTask(a)) ||
                        taskScore(b, s) - taskScore(a, s),
                    )
                    .filter(
                      (t) =>
                        matchesText({
                          ...t,
                          name: customerName(t.customerId || t.leadId),
                        }) &&
                        fMatch("status", t.status) &&
                        fMatch("owner", t.owner) &&
                        fMatch("priority", t.priority) &&
                        dateMatch(t.due) &&
                        customerMatch(t.customerId) &&
                        relatedMatch(t),
                    )
                    .map((t) => (
                      <tr
                        key={t.id}
                        className={
                          t.status === "Completada" ? "completed-row" : ""
                        }
                      >
                        <td>
                          <button
                            className={`task-check ${t.status === "Completada" ? "done" : ""}`}
                            aria-label={`Completar ${t.title}`}
                            disabled={forms.readonly || !activeTask(t)}
                            onClick={() => statusTask(t, "Completada")}
                          >
                            <Icon name="check" size={13} />
                          </button>
                        </td>
                        <td>
                          <button
                            className="text-button cell-action"
                            onClick={() => forms.task(t)}
                          >
                            {t.title}
                          </button>
                          <small className="cell-sub">
                            {t.id} · {t.type}
                            {t.recurrence > 0
                              ? ` · cada ${t.recurrence} días`
                              : ""}
                          </small>
                          <small className="cell-sub">
                            {[t.caseId, t.paymentId, t.leadId]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        </td>
                        <td>
                          {t.customerId ? (
                            customerButton(t.customerId)
                          ) : (
                            <span>{customerName(t.leadId)}</span>
                          )}
                        </td>
                        <td>
                          <Badge tone={t.priority}>
                            {priorityLabels[t.priority]}
                          </Badge>
                        </td>
                        <td>
                          <span
                            className={
                              activeTask(t) && overdue(t.due, today)
                                ? "overdue-text"
                                : ""
                            }
                          >
                            {dateLabel(t.due)}
                          </span>
                        </td>
                        <td>{t.owner}</td>
                        <td>
                          <Select
                            label={`Estado ${t.id}`}
                            value={t.status}
                            options={taskStatuses}
                            disabled={forms.readonly}
                            onChange={(v) => statusTask(t, v)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="icon"
                            title={`Editar ${t.id}`}
                            icon="edit"
                            disabled={forms.readonly}
                            onClick={() => forms.task(t)}
                          />
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.tasks.some(
                  (t) =>
                    matchesText({
                      ...t,
                      name: customerName(t.customerId || t.leadId),
                    }) &&
                    fMatch("status", t.status) &&
                    fMatch("owner", t.owner) &&
                    fMatch("priority", t.priority) &&
                    dateMatch(t.due) &&
                    customerMatch(t.customerId) &&
                    relatedMatch(t),
                ) && <Empty title="No hay tareas en esta vista" />}
              </section>
            </>
          )}

          {view === "cases" && (
            <>
              <div className="summary-tabs">
                <button
                  className={!filters.status ? "active" : ""}
                  onClick={() => setFilters({})}
                >
                  Todos los casos <b>{s.cases.length}</b>
                </button>
                <button
                  onClick={() => filter("status", "Investigando")}
                  className={filters.status === "Investigando" ? "active" : ""}
                >
                  Investigaciones{" "}
                  <b>
                    {s.cases.filter((c) => c.status === "Investigando").length}
                  </b>
                </button>
                <button
                  onClick={() => filter("priority", "critical")}
                  className={filters.priority === "critical" ? "active" : ""}
                >
                  Críticos{" "}
                  <b>
                    {openCases.filter((c) => c.priority === "critical").length}
                  </b>
                </button>
                <div className="spacer" />
                <Button
                  icon="plus"
                  disabled={forms.readonly}
                  onClick={() => forms.issue()}
                >
                  Abrir caso
                </Button>
              </div>
              <section className="panel table-panel">
                {filterBar(caseStatuses, [
                  priorityFilter,
                  { key: "category", label: "Categoría", options: categories },
                  dateFilter,
                  healthFilter,
                ])}
                <Table
                  headers={[
                    "Caso",
                    "Cliente",
                    "Categoría",
                    "Prioridad",
                    "Estado",
                    "Próxima actualización",
                    "Responsable",
                    "",
                  ]}
                >
                  {s.cases
                    .filter(
                      (c) =>
                        matchesText({
                          ...c,
                          name: customerName(c.customerId),
                        }) &&
                        fMatch("status", c.status) &&
                        fMatch("priority", c.priority) &&
                        fMatch("owner", c.owner) &&
                        fMatch("category", c.category) &&
                        dateMatch(c.nextUpdate) &&
                        customerMatch(c.customerId),
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <button
                            className="text-button cell-action"
                            onClick={() => forms.issue(c)}
                          >
                            {c.title}
                          </button>
                          <small className="cell-sub">
                            {c.id}
                            {s.escalations.some(
                              (e) =>
                                e.caseId === c.id && e.status !== "Cerrada",
                            )
                              ? " · Escalado"
                              : ""}
                          </small>
                        </td>
                        <td>{customerButton(c.customerId)}</td>
                        <td>
                          <span className="category-text">{c.category}</span>
                        </td>
                        <td>
                          <Badge tone={c.priority}>
                            {priorityLabels[c.priority]}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            tone={
                              c.status === "Resuelto" ? "healthy" : "neutral"
                            }
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td
                          className={
                            overdue(c.nextUpdate, today) ? "overdue-text" : ""
                          }
                        >
                          {dateLabel(c.nextUpdate)}
                        </td>
                        <td>{c.owner}</td>
                        <td>
                          <Button
                            variant="icon"
                            title={`Revisar ${c.id}`}
                            icon="right"
                            onClick={() => forms.issue(c)}
                          />
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.cases.some(
                  (c) =>
                    matchesText({ ...c, name: customerName(c.customerId) }) &&
                    fMatch("status", c.status) &&
                    fMatch("priority", c.priority) &&
                    fMatch("owner", c.owner) &&
                    fMatch("category", c.category) &&
                    dateMatch(c.nextUpdate) &&
                    customerMatch(c.customerId),
                ) && <Empty title="No hay casos en esta vista" />}
              </section>
            </>
          )}

          {view === "payments" && (
            <>
              <div className="summary-tabs">
                <span className="muted">
                  Registros de obligaciones y recepciones ficticias
                </span>
                <div className="spacer" />
                <Button
                  icon="plus"
                  disabled={forms.readonly}
                  onClick={() => forms.obligation()}
                >
                  Nueva obligación
                </Button>
              </div>
              <div className="stats-grid three">
                <Stat
                  label="Balance vencido"
                  value={money(totalOverdue)}
                  detail={`${new Set(latePayments.map((p) => p.customerId)).size} clientes con deuda vencida`}
                  icon="payments"
                />
                <Stat
                  label="Compromisos incumplidos"
                  value={missedPromises.length}
                  detail="Fechas concretas confirmadas por el cliente"
                  icon="clock"
                />
                <Stat
                  label="Recibido · registro local"
                  value={money(
                    s.payments
                      .filter((p) => p.status === "Recibido")
                      .reduce((n, p) => n + p.amount, 0),
                  )}
                  detail="No es conciliación bancaria"
                  icon="check"
                />
              </div>
              <div className="notice">
                <Icon name="lock" size={18} />
                <span>
                  No ofrecer financiación, descuentos, créditos ni cambios de
                  servicio sin política autorizada.{" "}
                  <strong>[SUPERVISOR APPROVAL REQUIRED]</strong>
                </span>
              </div>
              <section className="panel table-panel">
                {filterBar(
                  ["Pendiente", "Recibido"],
                  [
                    {
                      key: "aging",
                      label: "Antigüedad",
                      options: aging.map((a) => a.label),
                    },
                    {
                      key: "promise",
                      label: "Compromiso",
                      options: [
                        "Sin fecha acordada",
                        "Programado",
                        "Vence hoy",
                        "Incumplido",
                        "Cumplido",
                      ],
                    },
                    healthFilter,
                    dateFilter,
                  ],
                )}
                <Table
                  headers={[
                    "Cliente / referencia",
                    "Monto",
                    "Antigüedad",
                    "Último cobro / intento",
                    "Compromiso",
                    "Próxima acción / riesgo",
                    "Estado",
                    "Acciones",
                  ]}
                >
                  {s.payments
                    .filter(
                      (p) =>
                        matchesText({
                          ...p,
                          name: customerName(p.customerId),
                        }) &&
                        fMatch("status", p.status) &&
                        fMatch("aging", ageBucket(daysBetween(p.due, today))) &&
                        fMatch("promise", promiseStatus(p, today)) &&
                        fMatch(
                          "owner",
                          getCustomer(p.customerId)?.owner || "",
                        ) &&
                        dateMatch(p.due) &&
                        customerMatch(p.customerId),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          {customerButton(p.customerId)}
                          <small className="cell-sub payment-ref">
                            {p.reference}
                          </small>
                        </td>
                        <td className="number-cell">{money(p.amount)}</td>
                        <td>
                          {p.status === "Recibido" ? (
                            <Badge tone="healthy">Recibido</Badge>
                          ) : (
                            <>
                              <Badge
                                tone={
                                  overdue(p.due, today) ? "high" : "neutral"
                                }
                              >
                                {ageBucket(daysBetween(p.due, today))}
                              </Badge>
                              <small className="cell-sub">
                                Venció {dateLabel(p.due)}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <span>{dateLabel(p.lastPayment)}</span>
                          <small className="cell-sub">
                            Intento: {dateLabel(p.lastAttempt)}
                          </small>
                        </td>
                        <td>
                          <Badge
                            tone={
                              promiseStatus(p, today) === "Incumplido"
                                ? "high"
                                : p.status === "Recibido"
                                  ? "healthy"
                                  : "neutral"
                            }
                          >
                            {promiseStatus(p, today)}
                          </Badge>
                          <small className="cell-sub">
                            {p.promiseDate
                              ? dateLabel(p.promiseDate)
                              : "Pedir una fecha concreta"}
                          </small>
                        </td>
                        <td>
                          <span className="cell-action">
                            {getCustomer(p.customerId)?.nextAction ||
                              "Revisar seguimiento"}
                          </span>
                          <small className="cell-sub">
                            {
                              healthLabels[
                                getCustomer(p.customerId)?.health || "healthy"
                              ]
                            }{" "}
                            ·{" "}
                            {s.escalations.some(
                              (e) =>
                                e.customerId === p.customerId &&
                                e.status !== "Cerrada",
                            )
                              ? "Escalado"
                              : "Sin escalación"}
                          </small>
                        </td>
                        <td>
                          <Badge
                            tone={
                              p.status === "Recibido" ? "healthy" : "neutral"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="table-row-actions">
                            {p.status === "Pendiente" ? (
                              <>
                                <Button
                                  variant="secondary"
                                  disabled={forms.readonly}
                                  onClick={() => forms.payment(p)}
                                >
                                  Compromiso
                                </Button>
                                <Button
                                  variant="ghost"
                                  disabled={forms.readonly}
                                  onClick={() => forms.payment(p, true)}
                                >
                                  Registrar pago
                                </Button>
                              </>
                            ) : (
                              <span className="muted small">
                                {dateLabel(p.receivedAt)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.payments.some(
                  (p) =>
                    matchesText({ ...p, name: customerName(p.customerId) }) &&
                    fMatch("status", p.status) &&
                    fMatch("aging", ageBucket(daysBetween(p.due, today))) &&
                    fMatch("promise", promiseStatus(p, today)) &&
                    fMatch("owner", getCustomer(p.customerId)?.owner || "") &&
                    dateMatch(p.due) &&
                    customerMatch(p.customerId),
                ) && <Empty title="No hay pagos en esta vista" />}
              </section>
              <div className="two-columns">
                <section className="panel">
                  <SectionHead title="Antigüedad del saldo pendiente" />
                  <Bars data={aging} currency />
                </section>
                <section className="panel">
                  <SectionHead title="Cuando un compromiso vence" />
                  <p className="muted">
                    Creá una acción de seguimiento para una fecha confirmada que
                    no se cumplió. No se cambia el servicio ni se promete una
                    opción financiera.
                  </p>
                  {missedPromises.map((p) => {
                    const key = `promise-${p.id}-${p.promiseDate}`;
                    const exists = s.tasks.some((t) => t.sourceKey === key);
                    return (
                      <div className="policy-row" key={p.id}>
                        <span>
                          <strong>
                            {customerName(p.customerId)} · {money(p.amount)}
                          </strong>
                          <small>{dateLabel(p.promiseDate)}</small>
                        </span>
                        <Button
                          variant="secondary"
                          disabled={forms.readonly || exists}
                          onClick={() =>
                            forms.change(
                              "Seguimiento de compromiso creado",
                              p.id,
                              (state) => ({
                                ...state,
                                tasks: [
                                  ...state.tasks,
                                  {
                                    id: uid("TASK"),
                                    customerId: p.customerId,
                                    title: `Revisar pago comprometido · ${p.reference}`,
                                    type: "Cobranza",
                                    priority: "high",
                                    owner: owners[0],
                                    due: today,
                                    status: "Por hacer",
                                    caseId: "",
                                    paymentId: p.id,
                                    leadId: "",
                                    recurrence: 0,
                                    sourceKey: key,
                                  },
                                ],
                              }),
                            )
                          }
                        >
                          {exists ? "Seguimiento creado" : "Crear seguimiento"}
                        </Button>
                      </div>
                    );
                  })}
                </section>
              </div>
            </>
          )}

          {view === "escalations" && (
            <>
              <div className="summary-tabs">
                <span className="muted">
                  {activeEscalations.length} solicitudes abiertas · ninguna
                  implica una aprobación automática
                </span>
                <div className="spacer" />
                <Button
                  icon="plus"
                  disabled={forms.readonly}
                  onClick={() => forms.escalation()}
                >
                  Crear escalación
                </Button>
              </div>
              <section className="panel table-panel">
                {filterBar(
                  ["Pendiente", "En revisión", "Cerrada"],
                  [priorityFilter, dateFilter, healthFilter],
                )}
                <Table
                  headers={[
                    "Escalación / cliente",
                    "Motivo",
                    "Prioridad",
                    "Responsable",
                    "Antigüedad",
                    "Próxima actualización",
                    "Estado",
                    "",
                  ]}
                >
                  {s.escalations
                    .filter(
                      (e) =>
                        matchesText({
                          ...e,
                          name: customerName(e.customerId),
                        }) &&
                        fMatch("status", e.status) &&
                        fMatch("priority", e.priority) &&
                        fMatch("owner", e.owner) &&
                        dateMatch(e.nextUpdate) &&
                        customerMatch(e.customerId),
                    )
                    .map((e) => (
                      <tr key={e.id}>
                        <td>
                          {customerButton(e.customerId)}
                          <small className="cell-sub">
                            {e.id} · {e.caseId || "General"}
                          </small>
                        </td>
                        <td>
                          <span className="cell-action">{e.reason}</span>
                          {e.approval && (
                            <small className="cell-sub approval-label">
                              Aprobación requerida
                            </small>
                          )}
                        </td>
                        <td>
                          <Badge tone={e.priority}>
                            {priorityLabels[e.priority]}
                          </Badge>
                        </td>
                        <td>{e.owner}</td>
                        <td>
                          {Math.max(0, daysBetween(e.created, today))} días
                        </td>
                        <td
                          className={
                            overdue(e.nextUpdate, today) &&
                            e.status !== "Cerrada"
                              ? "overdue-text"
                              : ""
                          }
                        >
                          {dateLabel(e.nextUpdate)}
                        </td>
                        <td>
                          <Badge>{e.status}</Badge>
                        </td>
                        <td>
                          <Button
                            variant="icon"
                            title={`Revisar ${e.id}`}
                            icon="edit"
                            disabled={forms.readonly}
                            onClick={() => forms.escalation(e)}
                          />
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.escalations.some(
                  (e) =>
                    matchesText({ ...e, name: customerName(e.customerId) }) &&
                    fMatch("status", e.status) &&
                    fMatch("priority", e.priority) &&
                    fMatch("owner", e.owner) &&
                    dateMatch(e.nextUpdate) &&
                    customerMatch(e.customerId),
                ) && <Empty title="Sin escalaciones en esta vista" />}
              </section>
              <div className="notice warning">
                <Icon name="flag" size={18} />
                <span>
                  <strong>[CONFIRM ESCALATION SLA]</strong> Confirmar equipo,
                  autoridad y plazo de actualización. Las fechas aquí son
                  compromisos de práctica.
                </span>
              </div>
            </>
          )}

          {view === "outreach" && (
            <>
              <div className="stats-grid three">
                <Stat
                  label="Prospectos"
                  value={s.leads.length}
                  detail={`${s.leads.filter((l) => l.stage === "Nuevo").length} nuevos · ${outreachDue.length} seguimientos pendientes`}
                  icon="outreach"
                />
                <Stat
                  label="Respondieron"
                  value={
                    s.leads.filter((l) =>
                      [
                        "Respondió",
                        "Calificado",
                        "Interesado",
                        "Derivado a ventas",
                        "Convertido",
                      ].includes(l.stage),
                    ).length
                  }
                  detail="Etapas registradas por el operador"
                  icon="communication"
                />
                <Stat
                  label="Handoffs a ventas"
                  value={
                    s.leads.filter((l) => l.stage === "Derivado a ventas")
                      .length
                  }
                  detail="Derivaciones internas documentadas"
                  icon="customers"
                />
              </div>
              <div className="outreach-sequence">
                <div>
                  <Icon name="clock" />
                  <strong>Secuencia de ejemplo</strong>
                  <small>Editable · no es política de Traqeer</small>
                </div>
                {s.config.sequenceDays.map((d, i) => (
                  <span key={i}>
                    <b>0{i + 1}</b>
                    <strong>
                      {i === 0
                        ? "Abrir conversación"
                        : i === 1
                          ? "Primer seguimiento"
                          : "Último seguimiento"}
                    </strong>
                    <small>Día {d}</small>
                  </span>
                ))}
              </div>
              <section className="panel table-panel">
                <SectionHead title="Conversaciones por iniciar">
                  <Button
                    icon="plus"
                    disabled={forms.readonly}
                    onClick={() => forms.lead()}
                  >
                    Nuevo prospecto
                  </Button>
                </SectionHead>
                {filterBar(leadStages, [
                  dateFilter,
                  {
                    key: "platform",
                    label: "Plataforma",
                    options: ["OnlyFans", "Fansly", "Otra"],
                  },
                ])}
                <Table
                  headers={[
                    "Prospecto",
                    "Problema / objeción",
                    "Etapa",
                    "Último / próximo contacto",
                    "Responsable / handoff",
                    "Acciones",
                  ]}
                >
                  {s.leads
                    .filter(
                      (l) =>
                        matchesText(l) &&
                        fMatch("status", l.stage) &&
                        fMatch("owner", l.owner) &&
                        fMatch("platform", l.platform) &&
                        dateMatch(l.nextContact),
                    )
                    .map((l) => (
                      <tr key={l.id}>
                        <td>
                          <button
                            className="customer-link"
                            onClick={() => forms.lead(l)}
                          >
                            <Avatar name={l.name} />
                            <span>
                              <strong>{l.name}</strong>
                              <small>
                                {l.platform} ·{" "}
                                {l.audience
                                  ? `${l.audience.toLocaleString()} audiencia aprox.`
                                  : "Audiencia por confirmar"}
                              </small>
                            </span>
                          </button>
                          <small className="cell-sub">
                            {l.id} · {l.source}
                          </small>
                        </td>
                        <td>
                          <span className="cell-action">{l.pain}</span>
                          <small className="cell-sub">
                            {l.objection || "Objeción por confirmar"}
                          </small>
                        </td>
                        <td>
                          <Badge
                            tone={
                              l.stage === "Interesado" ||
                              l.stage === "Derivado a ventas"
                                ? "healthy"
                                : l.stage === "No contactar"
                                  ? "high"
                                  : "neutral"
                            }
                          >
                            {l.stage}
                          </Badge>
                        </td>
                        <td>
                          <span>{dateLabel(l.lastContact)}</span>
                          <small
                            className={`cell-sub ${overdue(l.nextContact, today) ? "overdue-text" : ""}`}
                          >
                            Próximo: {dateLabel(l.nextContact)}
                          </small>
                        </td>
                        <td>
                          <span>{l.owner}</span>
                          <small className="cell-sub">
                            {l.handoff || "Sin handoff"}
                          </small>
                        </td>
                        <td>
                          <div className="table-row-actions">
                            <Button
                              variant="secondary"
                              disabled={
                                forms.readonly || l.stage === "No contactar"
                              }
                              onClick={() => forms.leadContact(l)}
                            >
                              Registrar contacto
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => forms.lead(l)}
                              disabled={forms.readonly}
                            >
                              Editar / derivar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </Table>
                {!s.leads.some(
                  (l) =>
                    matchesText(l) &&
                    fMatch("status", l.stage) &&
                    fMatch("owner", l.owner) &&
                    fMatch("platform", l.platform) &&
                    dateMatch(l.nextContact),
                ) && <Empty title="Sin prospectos en esta vista" />}
              </section>
            </>
          )}

          {view === "communication" && (
            <div className="communication-layout">
              <aside className="panel conversation-list">
                <SectionHead title="Conversaciones">
                  <Badge>{s.customers.length}</Badge>
                </SectionHead>
                <div className="search-field">
                  <Icon name="search" size={16} />
                  <input
                    aria-label="Buscar conversación"
                    placeholder="Buscar cliente…"
                    value={commSearch}
                    onChange={(e) => setCommSearch(e.target.value)}
                  />
                </div>
                {s.customers
                  .filter((c) =>
                    `${c.name} ${c.id}`
                      .toLowerCase()
                      .includes(commSearch.toLowerCase()),
                  )
                  .map((c) => {
                    const last = [...s.interactions]
                      .filter((i) => i.customerId === c.id)
                      .sort((a, b) => b.date.localeCompare(a.date))[0];
                    return (
                      <button
                        className={`conversation-person ${conversation === c.id ? "selected" : ""}`}
                        key={c.id}
                        onClick={() => {
                          if (
                            draft.trim() &&
                            !window.confirm(
                              "El borrador actual no está guardado. ¿Cambiar de conversación?",
                            )
                          )
                            return;
                          setConversation(c.id);
                          setDraft("");
                        }}
                      >
                        <Avatar name={c.name} />
                        <span>
                          <strong>
                            {c.name}
                            {c.vip && <Icon name="vip" size={12} />}
                          </strong>
                          <small>
                            {last?.text || "Sin mensajes registrados"}
                          </small>
                        </span>
                        <span className={`health-mini ${c.health}`} />
                      </button>
                    );
                  })}
              </aside>
              <section className="panel conversation-detail">
                <div className="conversation-header">
                  {customerButton(conversation)}
                  <Button
                    variant="ghost"
                    icon="flag"
                    disabled={forms.readonly}
                    onClick={() => forms.escalation(undefined, conversation)}
                  >
                    Escalar
                  </Button>
                  <Button
                    variant="secondary"
                    icon="cases"
                    disabled={forms.readonly}
                    onClick={() => forms.issue(undefined, conversation)}
                  >
                    Caso
                  </Button>
                </div>
                <div className="channel-notice">
                  <Icon name="lock" size={14} /> Canales no integrados. Solo se
                  guardan borradores y registros locales.
                </div>
                <div className="conversation-timeline">
                  <Timeline customerId={conversation} />
                  <div className="conversation-case-links">
                    <span>Casos relacionados</span>
                    {s.cases
                      .filter(
                        (c) =>
                          c.customerId === conversation &&
                          c.status !== "Resuelto",
                      )
                      .map((c) => (
                        <Button
                          key={c.id}
                          variant="secondary"
                          onClick={() => forms.issue(c)}
                        >
                          {c.id} · Revisar / resolver
                        </Button>
                      ))}
                  </div>
                </div>
                <div className="composer">
                  <div className="composer-controls">
                    <Select
                      label="Tipo de comunicación"
                      value={draftMode}
                      options={[
                        { value: "draft", label: "Borrador · no enviado" },
                        { value: "contact", label: "Contacto realizado" },
                        { value: "incoming", label: "Mensaje recibido" },
                        { value: "note", label: "Nota interna" },
                      ]}
                      onChange={setDraftMode}
                    />
                    <Select
                      label="Canal de comunicación"
                      value={commChannel}
                      options={[
                        "Email",
                        "WhatsApp",
                        "Telegram",
                        "Phone",
                        "Internal note",
                      ]}
                      onChange={setCommChannel}
                    />
                  </div>
                  <textarea
                    aria-label="Contenido de comunicación"
                    placeholder={
                      draftMode === "draft"
                        ? "Escribí una respuesta con empatía, contexto y una próxima actualización…"
                        : "Registrá el contenido de la interacción…"
                    }
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={4}
                    disabled={forms.readonly}
                  />
                  <div className="composer-followup">
                    <input
                      aria-label="Próxima acción de comunicación"
                      placeholder="Próxima acción (opcional)"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      disabled={forms.readonly}
                    />
                    <DatePicker
                      label="Fecha de seguimiento de comunicación"
                      value={nextDate}
                      onChange={setNextDate}
                    />
                  </div>
                  <div className="composer-footer">
                    <span>
                      <Icon name="note" size={14} />
                      {draftMode === "draft"
                        ? "No se enviará ningún mensaje"
                        : "Registro de una interacción externa"}
                    </span>
                    <Button
                      icon={draftMode === "draft" ? "note" : "check"}
                      onClick={saveConversation}
                      disabled={forms.readonly || !draft.trim()}
                    >
                      {draftMode === "draft"
                        ? "Guardar borrador"
                        : "Registrar interacción"}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {view === "quality" && (
            <>
              <div className="stats-grid three">
                <Stat
                  label="Registros para revisar"
                  value={new Set(findings.map((f) => f.recordId)).size}
                  detail={`${findings.length} hallazgos · ${s.rawRecords.length} registros de origen`}
                  icon="quality"
                />
                <Stat
                  label="Posibles duplicados"
                  value={findings.filter((f) => f.type === "Duplicado").length}
                  detail="Teléfono compartido; identidad sin confirmar"
                  icon="customers"
                />
                <Stat
                  label="Fechas y datos contradictorios"
                  value={
                    findings.filter((f) =>
                      ["Fecha inválida", "Contradicción"].includes(f.type),
                    ).length
                  }
                  detail="No se corrigen automáticamente"
                  icon="warning"
                />
              </div>
              <div className="notice warning">
                <Icon name="note" />
                <span>
                  Estos datos de origen conservan los errores del ejercicio. No
                  afectan los saldos ni las métricas de clientes. Cada
                  corrección necesita revisión humana.
                </span>
              </div>
              <section className="panel table-panel">
                {filterBar(
                  [],
                  [
                    {
                      key: "finding",
                      label: "Hallazgo",
                      options: [...new Set(findings.map((f) => f.type))],
                    },
                  ],
                )}
                <Table
                  headers={[
                    "Registro de origen",
                    "Contacto original",
                    "Último / próxima fecha",
                    "Próxima acción",
                    "Monto original",
                    "Hallazgos",
                    "",
                  ]}
                >
                  {s.rawRecords
                    .filter(
                      (r) =>
                        matchesText(r) &&
                        (!filters.finding ||
                          filters.finding === "Todos" ||
                          findings.some(
                            (f) =>
                              f.recordId === r.id && f.type === filters.finding,
                          )),
                    )
                    .map((r) => {
                      const issues = findings.filter(
                        (f) => f.recordId === r.id,
                      );
                      return (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.name}</strong>
                            <small className="cell-sub">
                              {r.id} · {r.stage}
                            </small>
                            {r.review && (
                              <small className="cell-sub review-note">
                                Revisado: {r.review}
                              </small>
                            )}
                          </td>
                          <td>
                            <code>{r.phone || "Faltante"}</code>
                          </td>
                          <td>
                            <span
                              className={
                                issues.some((f) => f.field === "lastContact")
                                  ? "overdue-text"
                                  : ""
                              }
                            >
                              {r.lastContact || "Faltante"}
                            </span>
                            <small
                              className={`cell-sub ${issues.some((f) => f.field === "nextDate") ? "overdue-text" : ""}`}
                            >
                              {r.nextDate || "Faltante"}
                            </small>
                          </td>
                          <td>
                            {r.nextAction || (
                              <Badge tone="high">Faltante</Badge>
                            )}
                          </td>
                          <td>
                            <code>{r.amount}</code>
                          </td>
                          <td>
                            <div className="finding-badges">
                              {issues.map((f) => (
                                <span
                                  key={f.id}
                                  className={`finding ${f.severity}`}
                                  title={f.message}
                                >
                                  {f.type}
                                </span>
                              ))}
                              {!issues.length && (
                                <Badge tone="healthy">Sin hallazgos</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <Button
                              variant="secondary"
                              disabled={forms.readonly}
                              onClick={() => forms.raw(r)}
                            >
                              Revisar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </Table>
                {!s.rawRecords.some(
                  (r) =>
                    matchesText(r) &&
                    (!filters.finding ||
                      filters.finding === "Todos" ||
                      findings.some(
                        (f) =>
                          f.recordId === r.id && f.type === filters.finding,
                      )),
                ) && <Empty title="Sin registros en esta vista" />}
              </section>
              <section className="panel">
                <SectionHead title="Detalle de los hallazgos" />
                <div className="findings-grid">
                  {findings
                    .filter(
                      (f) =>
                        matchesText({
                          ...f,
                          record: s.rawRecords.find((r) => r.id === f.recordId)
                            ?.name,
                        }) &&
                        (!filters.finding ||
                          filters.finding === "Todos" ||
                          f.type === filters.finding),
                    )
                    .map((f) => (
                      <button
                        className="finding-detail"
                        key={f.id}
                        onClick={() => {
                          const r = s.rawRecords.find(
                            (r) => r.id === f.recordId,
                          );
                          if (r) forms.raw(r);
                          else setSelectedCustomer(f.recordId);
                        }}
                      >
                        <span className={`finding-icon ${f.severity}`}>
                          <Icon
                            name={
                              f.type === "Duplicado" ? "customers" : "warning"
                            }
                            size={18}
                          />
                        </span>
                        <span>
                          <strong>
                            {s.rawRecords.find((r) => r.id === f.recordId)
                              ?.name || customerName(f.recordId)}{" "}
                            · {f.type}
                          </strong>
                          <small>{f.message}</small>
                        </span>
                        <Icon name="right" size={15} />
                      </button>
                    ))}
                </div>
              </section>
            </>
          )}

          {view === "analytics" && (
            <>
              <div className="stats-grid">
                <Stat
                  label="Clientes activos"
                  value={
                    s.customers.filter((c) => c.account.status === "Activo")
                      .length
                  }
                  detail={`${s.customers.filter((c) => c.vip).length} VIP · ${atRisk.length} en riesgo`}
                  icon="customers"
                />
                <Stat
                  label="Resolución media"
                  value={(() => {
                    const resolved = s.cases.filter(
                      (c) =>
                        c.status === "Resuelto" &&
                        isISODate(c.resolvedAt) &&
                        isISODate(c.created),
                    );
                    return resolved.length
                      ? `${(resolved.reduce((n, c) => n + daysBetween(c.created, c.resolvedAt), 0) / resolved.length).toFixed(1)} d`
                      : "Sin datos";
                  })()}
                  detail="Solo casos con cierre y creación registrados"
                  icon="clock"
                />
                <Stat
                  label="Respuesta de prospectos"
                  value={(() => {
                    const contacted = s.leads.filter((l) => l.lastContact);
                    return contacted.length
                      ? `${Math.round((s.leads.filter((l) => l.lastContact && ["Respondió", "Calificado", "Interesado", "Derivado a ventas", "Convertido"].includes(l.stage)).length / contacted.length) * 100)}%`
                      : "Sin datos";
                  })()}
                  detail="Respuesta registrada / prospectos contactados"
                  icon="outreach"
                />
                <Stat
                  label="Recepción registrada"
                  value={
                    s.payments.length
                      ? `${Math.round(
                          (s.payments
                            .filter((p) => p.status === "Recibido")
                            .reduce((n, p) => n + p.amount, 0) /
                            Math.max(
                              s.payments.reduce((n, p) => n + p.amount, 0),
                              1,
                            )) *
                            100,
                        )}%`
                      : "Sin datos"
                  }
                  detail="Monto recibido / obligaciones registradas"
                  icon="payments"
                />
              </div>
              <div className="two-columns">
                <section className="panel">
                  <SectionHead title="Salud de clientes" />
                  <Donut data={healthData} />
                </section>
                <section className="panel">
                  <SectionHead title="Balance por antigüedad" />
                  <Bars data={aging} currency />
                </section>
                <section className="panel">
                  <SectionHead title="Categorías abiertas" />
                  <Bars
                    data={categories
                      .map((label) => ({
                        label,
                        value: openCases.filter((c) => c.category === label)
                          .length,
                      }))
                      .filter((d) => d.value > 0)}
                  />
                </section>
                <section className="panel">
                  <SectionHead title="Outreach por etapa" />
                  <Bars
                    data={leadStages
                      .map((label) => ({
                        label,
                        value: s.leads.filter((l) => l.stage === label).length,
                      }))
                      .filter((d) => d.value > 0)}
                  />
                </section>
                <section className="panel">
                  <SectionHead title="Actividad de protección" />
                  <LineChart data={removalData} label="Remociones ficticias" />
                  <p className="muted small">
                    {s.incidents.filter((i) => i.recurrence > 1).length}{" "}
                    incidentes con recurrencia registrada.
                  </p>
                </section>
                <section className="panel">
                  <SectionHead title="Retención, churn y reactivación" />
                  <Empty
                    title="Hace falta más historia"
                    text="No hay un período de observación ni cambios de estado suficientes para calcular estas métricas con fiabilidad."
                  />
                </section>
              </div>
            </>
          )}

          {view === "playbooks" && (
            <div className="playbook-layout">
              <section className="panel playbook-menu">
                <SectionHead title="Biblioteca operativa" />
                {s.playbooks.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setBook(p.id)}
                    className={book === p.id ? "active" : ""}
                  >
                    <Icon name="playbooks" size={18} />
                    <span>{p.title}</span>
                    <Icon name="right" size={14} />
                  </button>
                ))}
              </section>
              {s.playbooks.find((p) => p.id === book) &&
                (() => {
                  const p = s.playbooks.find((p) => p.id === book)!;
                  return (
                    <article className="panel playbook-article">
                      <Badge
                        tone={
                          p.status === "Confirmado para práctica"
                            ? "healthy"
                            : "high"
                        }
                      >
                        {p.status}
                      </Badge>
                      <span className="eyebrow">GUÍA DE PRÁCTICA · {p.id}</span>
                      <h2>{p.title}</h2>
                      <div className="policy-marker">{p.marker}</div>
                      <p className="playbook-body">{p.body}</p>
                      <div className="playbook-checklist">
                        <h3>Antes de actuar</h3>
                        {[
                          "Separá hechos comprobados de hipótesis.",
                          "Confirmá qué podés prometer dentro de tu autoridad.",
                          "Registrá una próxima acción y su responsable.",
                          "Documentá compromisos y la actualización al cliente.",
                        ].map((x) => (
                          <p key={x}>
                            <Icon name="check" size={16} />
                            {x}
                          </p>
                        ))}
                      </div>
                      <div className="notice">
                        <Icon name="lock" />
                        <span>
                          Este contenido es una guía del ejercicio. La política
                          real de Traqeer requiere confirmación interna.
                        </span>
                      </div>
                      <Button
                        icon="edit"
                        variant="secondary"
                        disabled={s.config.role !== "supervisor"}
                        onClick={() => forms.playbook(p)}
                      >
                        Editar guía · supervisión simulada
                      </Button>
                    </article>
                  );
                })()}
            </div>
          )}

          {view === "audit" && (
            <section className="panel table-panel">
              {filterBar(
                [],
                [
                  {
                    key: "actor",
                    label: "Actor",
                    options: [...new Set(s.audit.map((a) => a.actor))],
                  },
                ],
              )}
              <Table
                headers={[
                  "Fecha UTC",
                  "Actor",
                  "Acción",
                  "Registro",
                  "Detalle",
                ]}
              >
                {s.audit
                  .filter((a) => matchesText(a) && fMatch("actor", a.actor))
                  .map((a) => (
                    <tr key={a.id}>
                      <td>
                        {new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "UTC",
                        }).format(new Date(a.date))}
                      </td>
                      <td>{a.actor}</td>
                      <td>
                        <strong>{a.action}</strong>
                      </td>
                      <td>
                        <code>{a.entity}</code>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          icon="eye"
                          onClick={() => setAuditSelection(a.id)}
                        >
                          Antes / después
                        </Button>
                      </td>
                    </tr>
                  ))}
              </Table>
              {!s.audit.some(
                (a) => matchesText(a) && fMatch("actor", a.actor),
              ) && (
                <Empty
                  title="El historial empieza con tu primer cambio"
                  text="Crear, editar, registrar o completar una acción deja una entrada local con actor y fecha."
                />
              )}
              <div className="table-footnote">
                Historial local de práctica. No es un registro de auditoría
                inmutable ni una garantía de cumplimiento.
              </div>
            </section>
          )}

          {view === "settings" && (
            <div className="settings-layout">
              <section className="panel">
                <SectionHead title="Contexto de práctica" />
                <div className="settings-row">
                  <div>
                    <strong>Fecha de referencia</strong>
                    <p>Determina vencimientos, alertas y la cola diaria.</p>
                  </div>
                  <DatePicker
                    value={today}
                    label="Fecha de referencia"
                    onChange={(v) => {
                      if (isISODate(v))
                        forms.change(
                          "Fecha de práctica cambiada",
                          "Configuración",
                          (state) => ({
                            ...state,
                            config: { ...state.config, referenceDate: v },
                          }),
                        );
                    }}
                  />
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Rol simulado</strong>
                    <p>Práctica de permisos; no es autenticación real.</p>
                  </div>
                  <Select
                    label="Rol simulado"
                    value={s.config.role}
                    options={[
                      { value: "operator", label: "Operador" },
                      { value: "supervisor", label: "Supervisión" },
                      { value: "viewer", label: "Solo consulta" },
                    ]}
                    onChange={(v) => {
                      if (
                        mutate(
                          "Rol simulado cambiado",
                          "Configuración",
                          (state) => ({
                            ...state,
                            config: {
                              ...state.config,
                              role: v as Store["config"]["role"],
                            },
                          }),
                        )
                      )
                        notify("Rol de práctica actualizado");
                    }}
                  />
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Inactividad (días)</strong>
                    <p>Supuesto configurable, no política de la empresa.</p>
                  </div>
                  <input
                    type="number"
                    aria-label="Umbral de inactividad"
                    min="1"
                    max="3650"
                    key={`inactive-${s.config.inactiveDays}`}
                    defaultValue={s.config.inactiveDays}
                    disabled={forms.readonly}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (
                        Number.isInteger(v) &&
                        v > 0 &&
                        v <= 3650 &&
                        v !== s.config.inactiveDays
                      )
                        forms.change(
                          "Umbral de inactividad cambiado",
                          "Configuración",
                          (state) => ({
                            ...state,
                            config: { ...state.config, inactiveDays: v },
                          }),
                        );
                      else e.target.value = String(s.config.inactiveDays);
                    }}
                  />
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Etapa prolongada (días)</strong>
                    <p>Fecha de ingreso como aproximación de duración.</p>
                  </div>
                  <input
                    type="number"
                    aria-label="Umbral de etapa prolongada"
                    min="1"
                    max="3650"
                    key={`stuck-${s.config.stuckDays}`}
                    defaultValue={s.config.stuckDays}
                    disabled={forms.readonly}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (
                        Number.isInteger(v) &&
                        v > 0 &&
                        v <= 3650 &&
                        v !== s.config.stuckDays
                      )
                        forms.change(
                          "Umbral de etapa cambiado",
                          "Configuración",
                          (state) => ({
                            ...state,
                            config: { ...state.config, stuckDays: v },
                          }),
                        );
                      else e.target.value = String(s.config.stuckDays);
                    }}
                  />
                </div>
                <div className="settings-row">
                  <div>
                    <strong>Secuencia outreach · días relativos</strong>
                    <p>Ejemplo del ejercicio; no se envía automáticamente.</p>
                  </div>
                  <div className="sequence-inputs">
                    {s.config.sequenceDays.map((v, i) => (
                      <input
                        key={`${i}-${v}`}
                        aria-label={`Día del paso ${i + 1}`}
                        type="number"
                        min="0"
                        max="365"
                        defaultValue={v}
                        disabled={forms.readonly}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          const next = s.config.sequenceDays.map((d, idx) =>
                            idx === i ? n : d,
                          );
                          if (
                            Number.isInteger(n) &&
                            n >= 0 &&
                            n <= 365 &&
                            next.every(
                              (d, idx) => idx === 0 || d > next[idx - 1],
                            )
                          )
                            forms.change(
                              "Secuencia de práctica cambiada",
                              "Configuración",
                              (state) => ({
                                ...state,
                                config: { ...state.config, sequenceDays: next },
                              }),
                            );
                          else {
                            e.target.value = String(v);
                            notify(
                              "Los pasos necesitan días enteros en orden ascendente.",
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>
              <section className="panel">
                <SectionHead title="Alertas visibles" />
                {Object.entries({
                  overdue: "Próximas acciones vencidas",
                  vip: "VIP con intención de baja",
                  promise: "Compromisos de pago incumplidos",
                  recurrence: "Incidentes recurrentes",
                  quality: "Errores de calidad CRM",
                  inactivity: "Clientes sin contacto reciente",
                }).map(([key, label]) => (
                  <div className="settings-row" key={key}>
                    <strong>{label}</strong>
                    <Toggle
                      label={label}
                      checked={s.config.alerts[key]}
                      disabled={forms.readonly}
                      onChange={(v) =>
                        forms.change(
                          "Visibilidad de alerta cambiada",
                          "Configuración",
                          (state) => ({
                            ...state,
                            config: {
                              ...state.config,
                              alerts: { ...state.config.alerts, [key]: v },
                            },
                          }),
                        )
                      }
                    />
                  </div>
                ))}
              </section>
              <section className="panel">
                <SectionHead title="Datos y recuperación" />
                <p className="muted">
                  Los cambios viven en este navegador. No hay sincronización con
                  Traqeer, respaldo remoto ni control de acceso real. Usá solo
                  datos ficticios.
                </p>
                <div className="data-actions">
                  <Button
                    variant="secondary"
                    icon="download"
                    onClick={() => setConfirm("export")}
                  >
                    Exportar workspace
                  </Button>
                  <Button
                    variant="secondary"
                    icon="upload"
                    disabled={forms.readonly || !!corruptRaw}
                    onClick={() => importRef.current?.click()}
                  >
                    Importar respaldo
                  </Button>
                  <Button
                    variant="danger"
                    disabled={forms.readonly}
                    onClick={() => setConfirm(corruptRaw ? "recover" : "reset")}
                  >
                    {corruptRaw
                      ? "Recuperar con datos de ejemplo"
                      : "Restablecer demo"}
                  </Button>
                </div>
                <input
                  hidden
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      if (file.size > 8 * 1024 * 1024) throw new Error();
                      const data = JSON.parse(await file.text());
                      if (!validStore(data)) throw new Error();
                      setPendingImport(data);
                      setConfirm("import");
                    } catch {
                      notify(
                        "El archivo no es un respaldo válido de este workspace (máximo 8 MB).",
                      );
                    }
                    e.target.value = "";
                  }}
                />
                {corruptRaw && (
                  <div className="notice warning">
                    <span>
                      Hay datos que no se pudieron leer. Descargalos antes de
                      reemplazarlos.
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        download(
                          corruptRaw,
                          "traqeer-datos-originales.txt",
                          "text/plain",
                        )
                      }
                    >
                      Descargar original
                    </Button>
                  </div>
                )}
                <Button variant="ghost" onClick={reload}>
                  Volver a leer el almacenamiento
                </Button>
              </section>
              <section className="panel">
                <SectionHead title="Integraciones y autoridad" />
                {[
                  "Email / WhatsApp / Telegram / Phone: no integrados.",
                  "Detección y remoción de contenido: requiere confirmar sistema real.",
                  "Facturación y opciones de pago: requiere política y aprobación.",
                  "Seguridad de producción: requiere autenticación y autorización del lado del servidor.",
                ].map((x) => (
                  <p className="integration-row" key={x}>
                    <Icon name="lock" size={16} />
                    {x}
                  </p>
                ))}
                <Badge tone="high">[COMPANY POLICY REQUIRED]</Badge>
              </section>
            </div>
          )}
          <footer className="workspace-footer">
            <span>
              <Icon name="quality" size={14} /> Traqeer · Customer Operations
            </span>
            <span>Datos ficticios · guardado local · USD</span>
          </footer>
        </main>
      </div>

      {searchOpen && (
        <Modal
          title="Buscar en tu workspace"
          onClose={() => setSearchOpen(false)}
        >
          <div className="command-search">
            <Icon name="search" />
            <input
              autoFocus
              aria-label="Búsqueda global"
              placeholder="Nombre, teléfono, email, caso o pago…"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
            />
          </div>
          <p className="muted small">
            Clientes, IDs, usuarios de plataforma, contactos, casos y
            referencias de pago.
          </p>
          <div className="search-results">
            {(() => {
              const term = globalQuery.toLowerCase().trim();
              const resultCustomers = s.customers.filter((c) =>
                `${c.name} ${c.id} ${c.phone} ${c.email} ${c.handle}`
                  .toLowerCase()
                  .includes(term),
              );
              const resultCases = term
                ? s.cases.filter((c) =>
                    `${c.id} ${c.title}`.toLowerCase().includes(term),
                  )
                : [];
              const resultPayments = term
                ? s.payments.filter((p) =>
                    `${p.id} ${p.reference}`.toLowerCase().includes(term),
                  )
                : [];
              const resultLeads = term
                ? s.leads.filter((l) =>
                    `${l.name} ${l.id} ${l.email}`.toLowerCase().includes(term),
                  )
                : [];
              return (
                <>
                  {resultCustomers.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      className="command-result"
                      onClick={() => {
                        setSearchOpen(false);
                        setSelectedCustomer(c.id);
                      }}
                    >
                      <Avatar name={c.name} />
                      <span>
                        <strong>{c.name}</strong>
                        <small>
                          {c.id} · {c.handle}
                        </small>
                      </span>
                      <Badge tone={c.health}>{healthLabels[c.health]}</Badge>
                    </button>
                  ))}
                  {resultCases.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      className="command-result"
                      onClick={() => {
                        setSearchOpen(false);
                        forms.issue(c);
                      }}
                    >
                      <Icon name="cases" />
                      <span>
                        <strong>{c.title}</strong>
                        <small>
                          {c.id} · {customerName(c.customerId)}
                        </small>
                      </span>
                    </button>
                  ))}
                  {resultPayments.map((p) => (
                    <button
                      key={p.id}
                      className="command-result"
                      onClick={() => {
                        setSearchOpen(false);
                        setSelectedCustomer(p.customerId);
                      }}
                    >
                      <Icon name="payments" />
                      <span>
                        <strong>{p.reference}</strong>
                        <small>
                          {customerName(p.customerId)} · {money(p.amount)}
                        </small>
                      </span>
                    </button>
                  ))}
                  {resultLeads.map((l) => (
                    <button
                      key={l.id}
                      className="command-result"
                      onClick={() => {
                        setSearchOpen(false);
                        go("outreach");
                        setQ(l.name);
                      }}
                    >
                      <Icon name="outreach" />
                      <span>
                        <strong>{l.name}</strong>
                        <small>
                          {l.id} · {l.stage}
                        </small>
                      </span>
                    </button>
                  ))}
                  {!resultCustomers.length &&
                    !resultCases.length &&
                    !resultPayments.length &&
                    !resultLeads.length && (
                      <Empty
                        title="Sin resultados"
                        text="Probá con otro nombre, ID o referencia."
                      />
                    )}
                </>
              );
            })()}
          </div>
        </Modal>
      )}
      {alertsOpen && (
        <Modal
          title={`Centro de atención · ${alerts.length} alertas`}
          onClose={() => setAlertsOpen(false)}
        >
          <div className="alert-list">
            {alerts.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setAlertsOpen(false);
                  if (a.customerId) setSelectedCustomer(a.customerId);
                  else go(a.route);
                }}
              >
                <span className="alert-icon">
                  <Icon name="warning" size={19} />
                </span>
                <span>
                  <strong>{a.title}</strong>
                  <small>{a.text}</small>
                </span>
                <Icon name="right" size={16} />
              </button>
            ))}
          </div>
          {!alerts.length && <Empty title="Sin alertas activas" />}
          <Button
            variant="ghost"
            icon="settings"
            onClick={() => {
              setAlertsOpen(false);
              go("settings");
            }}
          >
            Configurar reglas
          </Button>
        </Modal>
      )}
      {selectedCustomer && getCustomer(selectedCustomer) && (
        <Customer360
          key={selectedCustomer}
          customer={getCustomer(selectedCustomer)!}
          forms={forms}
          onClose={() => setSelectedCustomer("")}
          onCommunicate={communicate}
        />
      )}
      {auditSelection &&
        (() => {
          const a = s.audit.find((x) => x.id === auditSelection);
          return (
            a && (
              <Modal
                title={`${a.action} · ${a.entity}`}
                onClose={() => setAuditSelection("")}
                wide
              >
                <p className="muted">
                  {a.actor} · {a.date} · Valores del registro local; pueden
                  incluir contactos ficticios.
                </p>
                <div className="audit-diff">
                  <div>
                    <h3>Antes</h3>
                    <pre>{JSON.stringify(a.before, null, 2)}</pre>
                  </div>
                  <div>
                    <h3>Después</h3>
                    <pre>{JSON.stringify(a.after, null, 2)}</pre>
                  </div>
                </div>
              </Modal>
            )
          );
        })()}
      {confirm && (
        <Modal
          title={
            confirm === "export"
              ? "Exportar los datos locales"
              : confirm === "import"
                ? "Importar este respaldo"
                : "Restablecer el workspace"
          }
          onClose={() => setConfirm(null)}
        >
          <div className="confirm-body">
            <Icon
              name={confirm === "export" ? "download" : "warning"}
              size={32}
            />
            <p>
              {confirm === "export"
                ? "El archivo incluye contactos, conversaciones y el historial local. Guardalo solo en un lugar apropiado para estos datos ficticios."
                : confirm === "import"
                  ? "Este respaldo reemplazará todos los datos actuales. Exportá primero si querés conservar tus cambios."
                  : "Se reemplazarán los datos locales por los ejemplos originales. Esta acción elimina tus cambios actuales; exportá una copia antes de continuar."}
            </p>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setConfirm(null)}>
                Cancelar
              </Button>
              <Button
                variant={confirm === "export" ? "primary" : "danger"}
                onClick={() => {
                  if (confirm === "export") {
                    download(
                      JSON.stringify(s, null, 2),
                      `traqeer-workspace-${today}.json`,
                    );
                    notify("Respaldo exportado");
                  } else {
                    const ok =
                      confirm === "import" && pendingImport
                        ? replace(pendingImport)
                        : confirm === "recover"
                          ? recover()
                          : replace(createSeed());
                    if (!ok) {
                      notify(
                        "No se pudo reemplazar el almacenamiento. Revisá los permisos.",
                      );
                      return;
                    }
                    setSelectedCustomer("");
                    notify("Workspace actualizado");
                  }
                  setConfirm(null);
                }}
              >
                Confirmar{" "}
                {confirm === "export"
                  ? "exportación"
                  : confirm === "import"
                    ? "importación"
                    : "restablecimiento"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {forms.modal}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
          <button aria-label="Cerrar aviso" onClick={() => setToast("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  );
}
