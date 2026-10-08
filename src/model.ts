export type Priority = "critical" | "high" | "medium" | "low";
export type Health = "healthy" | "watch" | "risk" | "churn";
export type Role = "operator" | "supervisor" | "viewer";
export const priorityLabels = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};
export const healthLabels = {
  healthy: "Saludable",
  watch: "En observación",
  risk: "En riesgo",
  churn: "Riesgo de baja",
};
export const taskStatuses = [
  "Por hacer",
  "En progreso",
  "Esperando cliente",
  "Esperando equipo",
  "Completada",
  "Cancelada",
];
export const caseStatuses = [
  "Abierto",
  "Investigando",
  "Esperando cliente",
  "Esperando equipo",
  "Resuelto",
];
export const leadStages = [
  "Nuevo",
  "Contactado",
  "Sin respuesta",
  "Respondió",
  "Calificado",
  "Interesado",
  "Derivado a ventas",
  "Convertido",
  "No interesado",
  "No contactar",
];
export const categories = [
  "Piratería recurrente",
  "Facturación",
  "Descuento",
  "Pago",
  "Reporte de contenido",
  "Datos de contacto",
  "Privacidad / seguridad",
  "Insatisfacción",
  "Riesgo de baja",
  "Usabilidad",
  "Referido",
  "Preferencia de comunicación",
];
export const owners = [
  "Toti Gauna",
  "Revisión de supervisión",
  "Equipo de investigación",
  "Ventas",
];
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  handle: string;
  platforms: string[];
  owner: string;
  language: string;
  timezone: string;
  health: Health;
  vip: boolean;
  stage: string;
  sentiment: string;
  account: { status: string; since: string };
  subscription: {
    plan: string;
    monthly: number;
    discount: string;
    discountStart: string;
    discountEnd: string;
  };
  preference: { channel: string; notes: string };
  lastContact: string;
  nextAction: string;
  nextDate: string;
  notes: string;
}
export interface Task {
  id: string;
  customerId: string;
  title: string;
  type: string;
  priority: Priority;
  owner: string;
  due: string;
  status: string;
  caseId: string;
  paymentId: string;
  leadId: string;
  recurrence: number;
  sourceKey?: string;
}
export interface Case {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: string;
  owner: string;
  created: string;
  updated: string;
  nextUpdate: string;
  facts: string;
  hypothesis: string;
  evidence: string[];
  customerStatus: string;
  resolution: string;
  resolvedAt: string;
}
export interface Payment {
  id: string;
  reference: string;
  customerId: string;
  amount: number;
  due: string;
  status: "Pendiente" | "Recibido";
  receivedAt: string;
  lastAttempt: string;
  lastPayment: string;
  promiseDate: string;
  promiseText: string;
}
export interface Interaction {
  id: string;
  customerId: string;
  channel: string;
  kind: "draft" | "contact" | "incoming" | "note";
  text: string;
  date: string;
  author: string;
}
export interface Escalation {
  id: string;
  customerId: string;
  caseId: string;
  reason: string;
  owner: string;
  priority: Priority;
  created: string;
  nextUpdate: string;
  status: string;
  approval: boolean;
}
export interface Lead {
  id: string;
  name: string;
  email: string;
  platform: string;
  audience: number;
  source: string;
  pain: string;
  objection: string;
  stage: string;
  owner: string;
  lastContact: string;
  nextContact: string;
  handoff: string;
  notes: string;
}
export interface Incident {
  id: string;
  customerId: string;
  caseId: string;
  title: string;
  channel: string;
  evidence: string;
  date: string;
  recurrence: number;
}
export interface Removal {
  id: string;
  customerId: string;
  incidentId: string;
  date: string;
  count: number;
}
export interface RawRecord {
  id: string;
  phone: string;
  name: string;
  stage: string;
  lastContact: string;
  nextAction: string;
  nextDate: string;
  amount: string;
  review: string;
}
export interface Playbook {
  id: string;
  title: string;
  marker: string;
  body: string;
  status: string;
}
export interface Audit {
  id: string;
  date: string;
  actor: string;
  action: string;
  entity: string;
  before: unknown;
  after: unknown;
}
export interface Store {
  version: 1;
  revision: string;
  customers: Customer[];
  tasks: Task[];
  cases: Case[];
  payments: Payment[];
  interactions: Interaction[];
  escalations: Escalation[];
  leads: Lead[];
  incidents: Incident[];
  removals: Removal[];
  rawRecords: RawRecord[];
  playbooks: Playbook[];
  audit: Audit[];
  config: {
    referenceDate: string;
    inactiveDays: number;
    stuckDays: number;
    sequenceDays: number[];
    alerts: Record<string, boolean>;
    role: Role;
  };
}
export const uid = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
export function isISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export function daysBetween(a: string, b: string) {
  if (!isISODate(a) || !isISODate(b)) return 0;
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000,
  );
}
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function dateLabel(s: string) {
  return s && isISODate(s.slice(0, 10))
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(`${s.slice(0, 10)}T12:00:00Z`))
    : "Sin fecha";
}
export const activeTask = (t: Task) =>
  !["Completada", "Cancelada"].includes(t.status);
export const overdue = (date: string, today: string) =>
  isISODate(date) && date < today;
export function promiseStatus(p: Payment, today: string) {
  return p.status === "Recibido"
    ? "Cumplido"
    : !p.promiseDate
      ? "Sin fecha acordada"
      : p.promiseDate < today
        ? "Incumplido"
        : p.promiseDate === today
          ? "Vence hoy"
          : "Programado";
}
export const priorityScore = (p: Priority) =>
  ({ critical: 100, high: 65, medium: 25, low: 5 })[p];
export function taskScore(t: Task, s: Store) {
  const c = s.customers.find((x) => x.id === t.customerId);
  return (
    priorityScore(t.priority) +
    (c?.vip ? 25 : 0) +
    (c?.health === "churn" ? 35 : 0) +
    (overdue(t.due, s.config.referenceDate) ? 20 : 0)
  );
}
export const ageBucket = (days: number) =>
  days <= 0
    ? "Al día"
    : days <= 7
      ? "1–7 días"
      : days <= 30
        ? "8–30 días"
        : days <= 60
          ? "31–60 días"
          : days <= 90
            ? "61–90 días"
            : "90+ días";
export const safeLink = (url: string) => {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
export interface Finding {
  id: string;
  recordId: string;
  type: string;
  field: keyof RawRecord;
  message: string;
  severity: "high" | "medium";
}
function parseRawDate(raw: string): { iso?: string; error?: string } {
  if (!raw) return {};
  if (isISODate(raw)) return { iso: raw };
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { error: "Formato de fecha inválido" };
  const [, d, month, year] = m;
  if (+month > 12 && +d <= 12)
    return {
      error: "Formato MM/DD/YYYY inconsistente; confirmar interpretación",
    };
  const iso = `${year}-${month}-${d}`;
  return isISODate(iso)
    ? { iso }
    : { error: "Fecha imposible en el calendario" };
}
export function qualityFindings(s: Store): Finding[] {
  const results: Finding[] = [];
  const add = (
    r: RawRecord,
    field: keyof RawRecord,
    type: string,
    message: string,
    severity: "high" | "medium" = "medium",
  ) =>
    results.push({
      id: `${r.id}-${field}-${type}`,
      recordId: r.id,
      field,
      type,
      message,
      severity,
    });
  for (const r of s.rawRecords) {
    if (!r.name) add(r, "name", "Campo faltante", "Falta el nombre");
    if (!r.phone) add(r, "phone", "Campo faltante", "Falta el contacto");
    else if (!/^\+[1-9]\d{7,14}$/.test(r.phone))
      add(
        r,
        "phone",
        "Teléfono",
        "Confirmar código de país y formato internacional",
      );
    const normalized = r.phone.replace(/[^\d]/g, "");
    if (
      normalized &&
      s.rawRecords.some(
        (x) => x.id !== r.id && x.phone.replace(/[^\d]/g, "") === normalized,
      )
    )
      add(
        r,
        "phone",
        "Duplicado",
        "Otro registro comparte este teléfono. Identidad y montos requieren revisión.",
        "high",
      );
    if (!r.stage) add(r, "stage", "Campo faltante", "Falta etapa del cliente");
    const last = parseRawDate(r.lastContact),
      next = parseRawDate(r.nextDate);
    if (!r.lastContact)
      add(
        r,
        "lastContact",
        "Campo faltante",
        "Falta la fecha del último contacto",
      );
    if (last.error) add(r, "lastContact", "Fecha inválida", last.error, "high");
    if (next.error) add(r, "nextDate", "Fecha inválida", next.error, "high");
    if (!r.nextAction)
      add(
        r,
        "nextAction",
        "Acción faltante",
        "Confirmar si corresponde una próxima acción",
      );
    if (!r.nextDate)
      add(r, "nextDate", "Fecha faltante", "No hay fecha para el seguimiento");
    if (last.iso && next.iso && next.iso < last.iso)
      add(
        r,
        "nextDate",
        "Contradicción",
        "La próxima acción es anterior al último contacto",
        "high",
      );
    if (next.iso && overdue(next.iso, s.config.referenceDate))
      add(r, "nextDate", "Seguimiento vencido", "La próxima acción ya venció");
    if (r.amount && !/^\d+(\.\d{1,2})?$/.test(r.amount))
      add(
        r,
        "amount",
        "Monto ambiguo",
        "Confirmar si el separador representa miles o decimales; no se usa en métricas",
        "high",
      );
    if (!r.amount) add(r, "amount", "Campo faltante", "Falta monto");
    if (
      last.iso &&
      daysBetween(last.iso, s.config.referenceDate) > s.config.inactiveDays
    )
      add(
        r,
        "lastContact",
        "Inactividad",
        `Sin contacto por más de ${s.config.inactiveDays} días (umbral configurable)`,
      );
  }
  for (const c of s.customers) {
    const raw = { id: c.id } as RawRecord;
    if (!c.email && !c.phone)
      add(
        raw,
        "phone",
        "Campo faltante",
        `${c.name}: falta un medio de contacto`,
      );
    if (!c.nextAction && c.health !== "healthy")
      add(
        raw,
        "nextAction",
        "Acción faltante",
        `${c.name}: cliente en riesgo sin próxima acción`,
        "high",
      );
    if (c.nextAction && !c.nextDate)
      add(raw, "nextDate", "Fecha faltante", `${c.name}: acción sin fecha`);
    if (c.nextDate && c.lastContact && c.nextDate < c.lastContact)
      add(
        raw,
        "nextDate",
        "Contradicción",
        `${c.name}: próxima acción anterior al contacto`,
        "high",
      );
    if (
      c.lastContact &&
      daysBetween(c.lastContact, s.config.referenceDate) > s.config.inactiveDays
    )
      add(
        raw,
        "lastContact",
        "Inactividad",
        `${c.name}: revisar falta de contacto reciente`,
      );
    if (
      c.stage !== "Activo" &&
      daysBetween(c.account.since, s.config.referenceDate) > s.config.stuckDays
    )
      add(
        raw,
        "stage",
        "Etapa prolongada",
        `${c.name}: revisar etapa (fecha de ingreso como aproximación configurable)`,
      );
  }
  return results;
}
export function completeTask(s: Store, id: string): Store {
  const task = s.tasks.find((t) => t.id === id);
  if (!task || !activeTask(task)) return s;
  const tasks = s.tasks.map((t) =>
    t.id === id ? { ...t, status: "Completada" } : t,
  );
  if (
    task.recurrence > 0 &&
    !s.tasks.some((t) => t.sourceKey === `recurring-${task.id}`)
  )
    tasks.push({
      ...task,
      id: uid("TASK"),
      due: addDays(
        task.due > s.config.referenceDate ? task.due : s.config.referenceDate,
        task.recurrence,
      ),
      status: "Por hacer",
      sourceKey: `recurring-${task.id}`,
    });
  return { ...s, tasks };
}
// Strict enough to prevent malformed or adversarial local imports reaching a view.
export function validStore(value: unknown): value is Store {
  if (!value || typeof value !== "object") return false;
  const s = value as Store;
  const strings = (v: unknown, keys: string[]) =>
    !!v &&
    typeof v === "object" &&
    keys.every((k) => typeof (v as Record<string, unknown>)[k] === "string");
  const list = <T>(v: unknown, check: (x: T) => boolean) =>
    Array.isArray(v) &&
    v.every((x) => check(x as T)) &&
    new Set(v.map((x) => x.id)).size === v.length;
  if (
    s.version !== 1 ||
    !strings(s, ["revision"]) ||
    !s.config ||
    !isISODate(s.config.referenceDate) ||
    !["operator", "supervisor", "viewer"].includes(s.config.role) ||
    !Number.isInteger(s.config.inactiveDays) ||
    s.config.inactiveDays < 1 ||
    !Number.isInteger(s.config.stuckDays) ||
    s.config.stuckDays < 1 ||
    !Array.isArray(s.config.sequenceDays) ||
    !s.config.sequenceDays.every((n) => Number.isInteger(n) && n >= 0) ||
    !s.config.alerts ||
    Object.values(s.config.alerts).some((x) => typeof x !== "boolean")
  )
    return false;
  const number = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0;
  if (
    !list(
      s.customers,
      (c: Customer) =>
        strings(c, [
          "id",
          "name",
          "email",
          "phone",
          "handle",
          "owner",
          "language",
          "timezone",
          "stage",
          "sentiment",
          "lastContact",
          "nextAction",
          "nextDate",
          "notes",
        ]) &&
        c.id !== "" &&
        Array.isArray(c.platforms) &&
        c.platforms.every((p) => typeof p === "string") &&
        Object.keys(healthLabels).includes(c.health) &&
        typeof c.vip === "boolean" &&
        strings(c.account, ["status", "since"]) &&
        strings(c.subscription, [
          "plan",
          "discount",
          "discountStart",
          "discountEnd",
        ]) &&
        number(c.subscription.monthly) &&
        strings(c.preference, ["channel", "notes"]),
    )
  )
    return false;
  const ref = (id: string) => !id || s.customers.some((c) => c.id === id);
  const pri = (p: string) => Object.keys(priorityLabels).includes(p);
  if (
    !list(
      s.tasks,
      (t: Task) =>
        strings(t, [
          "id",
          "customerId",
          "title",
          "type",
          "owner",
          "due",
          "status",
          "caseId",
          "paymentId",
          "leadId",
        ]) &&
        ref(t.customerId) &&
        isISODate(t.due) &&
        pri(t.priority) &&
        taskStatuses.includes(t.status) &&
        Number.isInteger(t.recurrence) &&
        t.recurrence >= 0,
    )
  )
    return false;
  if (
    !list(
      s.cases,
      (c: Case) =>
        strings(c, [
          "id",
          "customerId",
          "title",
          "description",
          "category",
          "owner",
          "created",
          "updated",
          "nextUpdate",
          "facts",
          "hypothesis",
          "customerStatus",
          "resolution",
          "resolvedAt",
        ]) &&
        ref(c.customerId) &&
        pri(c.priority) &&
        caseStatuses.includes(c.status) &&
        Array.isArray(c.evidence) &&
        c.evidence.every((e) => !!safeLink(e)),
    )
  )
    return false;
  if (
    !list(
      s.payments,
      (p: Payment) =>
        strings(p, [
          "id",
          "customerId",
          "reference",
          "due",
          "status",
          "receivedAt",
          "lastAttempt",
          "lastPayment",
          "promiseDate",
          "promiseText",
        ]) &&
        ref(p.customerId) &&
        number(p.amount) &&
        isISODate(p.due) &&
        ["Pendiente", "Recibido"].includes(p.status) &&
        (!p.promiseDate || isISODate(p.promiseDate)),
    )
  )
    return false;
  if (
    !list(
      s.interactions,
      (i: Interaction) =>
        strings(i, [
          "id",
          "customerId",
          "channel",
          "kind",
          "text",
          "date",
          "author",
        ]) &&
        ref(i.customerId) &&
        ["draft", "contact", "incoming", "note"].includes(i.kind),
    )
  )
    return false;
  if (
    !list(
      s.escalations,
      (e: Escalation) =>
        strings(e, [
          "id",
          "customerId",
          "caseId",
          "reason",
          "owner",
          "created",
          "nextUpdate",
          "status",
        ]) &&
        ref(e.customerId) &&
        pri(e.priority) &&
        typeof e.approval === "boolean",
    )
  )
    return false;
  if (
    !list(
      s.leads,
      (l: Lead) =>
        strings(l, [
          "id",
          "name",
          "email",
          "platform",
          "source",
          "pain",
          "objection",
          "stage",
          "owner",
          "lastContact",
          "nextContact",
          "handoff",
          "notes",
        ]) &&
        number(l.audience) &&
        leadStages.includes(l.stage),
    )
  )
    return false;
  if (
    !list(
      s.incidents,
      (i: Incident) =>
        strings(i, [
          "id",
          "customerId",
          "caseId",
          "title",
          "channel",
          "evidence",
          "date",
        ]) &&
        ref(i.customerId) &&
        number(i.recurrence),
    )
  )
    return false;
  if (
    !list(
      s.removals,
      (r: Removal) =>
        strings(r, ["id", "customerId", "incidentId", "date"]) &&
        ref(r.customerId) &&
        number(r.count),
    )
  )
    return false;
  if (
    !list(s.rawRecords, (r: RawRecord) =>
      strings(r, [
        "id",
        "phone",
        "name",
        "stage",
        "lastContact",
        "nextAction",
        "nextDate",
        "amount",
        "review",
      ]),
    )
  )
    return false;
  if (
    !list(s.playbooks, (p: Playbook) =>
      strings(p, ["id", "title", "marker", "body", "status"]),
    )
  )
    return false;
  if (
    !list(
      s.audit,
      (a: Audit) =>
        strings(a, ["id", "date", "actor", "action", "entity"]) &&
        Number.isFinite(Date.parse(a.date)),
    )
  )
    return false;
  const optionalDate = (v: string) => v === "" || isISODate(v);
  const customerRef = (id: string) =>
    !!id && s.customers.some((c) => c.id === id);
  if (
    !s.customers.every(
      (c) =>
        isISODate(c.account.since) &&
        [
          c.lastContact,
          c.nextDate,
          c.subscription.discountStart,
          c.subscription.discountEnd,
        ].every(optionalDate),
    )
  )
    return false;
  if (
    !s.cases.every(
      (c) =>
        customerRef(c.customerId) &&
        [c.created, c.updated].every(isISODate) &&
        [c.nextUpdate, c.resolvedAt].every(optionalDate),
    )
  )
    return false;
  if (
    !s.payments.every(
      (p) =>
        customerRef(p.customerId) &&
        [p.receivedAt, p.lastAttempt, p.lastPayment].every(optionalDate),
    )
  )
    return false;
  if (
    !s.interactions.every(
      (i) => customerRef(i.customerId) && Number.isFinite(Date.parse(i.date)),
    )
  )
    return false;
  if (
    !s.escalations.every(
      (e) =>
        customerRef(e.customerId) &&
        isISODate(e.created) &&
        isISODate(e.nextUpdate) &&
        (!e.caseId ||
          s.cases.some(
            (c) => c.id === e.caseId && c.customerId === e.customerId,
          )),
    )
  )
    return false;
  if (!s.leads.every((l) => [l.lastContact, l.nextContact].every(optionalDate)))
    return false;
  if (
    !s.incidents.every(
      (i) =>
        customerRef(i.customerId) &&
        isISODate(i.date) &&
        (!i.evidence || !!safeLink(i.evidence)) &&
        s.cases.some((c) => c.id === i.caseId && c.customerId === i.customerId),
    )
  )
    return false;
  if (
    !s.removals.every(
      (r) =>
        customerRef(r.customerId) &&
        isISODate(r.date) &&
        s.incidents.some(
          (i) => i.id === r.incidentId && i.customerId === r.customerId,
        ),
    )
  )
    return false;
  return s.tasks.every(
    (t) =>
      (!t.caseId ||
        s.cases.some(
          (c) => c.id === t.caseId && c.customerId === t.customerId,
        )) &&
      (!t.paymentId ||
        s.payments.some(
          (p) => p.id === t.paymentId && p.customerId === t.customerId,
        )) &&
      (!t.leadId || s.leads.some((l) => l.id === t.leadId)),
  );
}
