import { useState } from "react";
import type {
  Customer,
  Case,
  Task,
  Payment,
  Lead,
  RawRecord,
  Playbook,
  Escalation,
  Incident,
} from "./model";
import {
  categories,
  caseStatuses,
  taskStatuses,
  leadStages,
  priorityLabels,
  healthLabels,
  owners,
  uid,
  addDays,
  safeLink,
  isISODate,
  completeTask,
} from "./model";
import { useStore } from "./store";
import { EntityForm, Modal } from "./components";
import type { Field } from "./components";
interface FormSpec {
  title: string;
  fields: Field[];
  initial: Record<string, string>;
  note?: string;
  submitLabel?: string;
  submit: (v: Record<string, string>) => boolean;
  validate?: (v: Record<string, string>) => string;
}
const text = (key: string, label: string, required = false): Field => ({
  key,
  label,
  required,
});
const area = (key: string, label: string, required = false): Field => ({
  key,
  label,
  type: "textarea",
  required,
});
const date = (key: string, label: string, required = false): Field => ({
  key,
  label,
  type: "date",
  required,
});
const choice = (
  key: string,
  label: string,
  options: Field["options"],
  required = true,
): Field => ({ key, label, type: "select", options, required });
const priorityOptions = Object.entries(priorityLabels).map(
  ([value, label]) => ({ value, label }),
);
const stringValues = (object: object) =>
  Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, String(v ?? "")]),
  );
export function useForms(notify: (s: string) => void) {
  const { state, mutate } = useStore();
  const [form, setForm] = useState<FormSpec | null>(null);
  const customerOptions = state.customers.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const leadOptions = [
    { value: "", label: "Sin prospecto" },
    ...state.leads.map((l) => ({ value: l.id, label: l.name })),
  ];
  const change = (
    action: string,
    entity: string,
    updater: Parameters<typeof mutate>[2],
  ) => {
    const ok = mutate(action, entity, updater);
    if (ok) notify("Guardado en tu workspace");
    return ok;
  };
  const readonly = state.config.role === "viewer";
  const open = (spec: FormSpec) => {
    if (readonly) {
      notify("El rol de consulta es de solo lectura.");
      return;
    }
    setForm(spec);
  };
  function customer(c?: Customer) {
    open({
      title: c ? "Editar cliente" : "Nuevo cliente",
      fields: [
        text("name", "Nombre", true),
        { ...text("email", "Email"), type: "email" },
        text("phone", "Teléfono internacional"),
        text("handle", "Usuario de plataforma"),
        text("platforms", "Plataformas (separadas por coma)", true),
        choice("owner", "Responsable", owners),
        choice(
          "health",
          "Salud de la relación",
          Object.entries(healthLabels).map(([value, label]) => ({
            value,
            label,
          })),
        ),
        { key: "vip", label: "Cliente VIP", type: "checkbox" },
        choice("stage", "Etapa", [
          "Activo",
          "En conversación",
          "Dormido",
          "Ganado",
          "Impago",
        ]),
        choice("accountStatus", "Estado de la cuenta", [
          "Activo",
          "Pendiente de confirmación",
        ]),
        text("plan", "Plan de ejemplo"),
        {
          key: "monthly",
          label: "Valor mensual USD",
          type: "number",
          required: true,
        },
        text("language", "Idioma", true),
        text("timezone", "Zona horaria", true),
        choice("channel", "Canal preferido", [
          "Email",
          "WhatsApp",
          "Telegram",
          "Phone",
        ]),
        text("sentiment", "Sentimiento observado"),
        date("since", "Cliente desde", true),
        date("lastContact", "Último contacto"),
        text("nextAction", "Próxima acción"),
        date("nextDate", "Fecha de próxima acción"),
        area("preferences", "Preferencias y restricciones"),
        area("notes", "Notas internas"),
      ],
      initial: c
        ? {
            ...stringValues(c),
            platforms: c.platforms.join(", "),
            monthly: String(c.subscription.monthly),
            plan: c.subscription.plan,
            since: c.account.since,
            accountStatus: c.account.status,
            channel: c.preference.channel,
            preferences: c.preference.notes,
          }
        : {
            name: "",
            email: "",
            phone: "",
            platforms: "OnlyFans",
            owner: owners[0],
            health: "healthy",
            vip: "false",
            stage: "Activo",
            accountStatus: "Activo",
            monthly: "89",
            plan: "Plan de ejemplo",
            language: "Español",
            timezone: "America/Argentina/Buenos_Aires",
            channel: "Email",
            since: state.config.referenceDate,
            lastContact: "",
            nextAction: "",
            nextDate: "",
          },
      note: "Datos ficticios de práctica. El cambio de estado no suspende ni modifica un servicio real.",
      validate: (v) =>
        !v.email && !v.phone
          ? "Agregá al menos un medio de contacto ficticio."
          : v.phone && !/^\+[1-9]\d{7,14}$/.test(v.phone)
            ? "Usá formato internacional: + y entre 8 y 15 dígitos."
            : (v.nextAction && !v.nextDate) || (!v.nextAction && v.nextDate)
              ? "La próxima acción necesita descripción y fecha."
              : v.nextDate && v.lastContact && v.nextDate < v.lastContact
                ? "La próxima acción no puede ser anterior al último contacto."
                : v.lastContact > state.config.referenceDate
                  ? "El último contacto no puede ser futuro respecto de la fecha de práctica."
                  : v.since > state.config.referenceDate
                    ? "La fecha de ingreso no puede ser futura."
                    : !v.platforms.split(",").some((p) => p.trim())
                      ? "Agregá una plataforma."
                      : "",
      submit: (v) => {
        const id = c?.id || uid("TQ");
        const next: Customer = {
          id,
          name: v.name.trim(),
          email: v.email,
          phone: v.phone,
          handle: v.handle || "",
          platforms: v.platforms
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          owner: v.owner,
          language: v.language,
          timezone: v.timezone,
          health: v.health as Customer["health"],
          vip: v.vip === "true",
          stage: v.stage,
          sentiment: v.sentiment || "Neutral",
          account: { status: v.accountStatus, since: v.since },
          subscription: {
            plan: v.plan || "Por confirmar",
            monthly: Number(v.monthly),
            discount: c?.subscription.discount || "",
            discountStart: c?.subscription.discountStart || "",
            discountEnd: c?.subscription.discountEnd || "",
          },
          preference: { channel: v.channel, notes: v.preferences || "" },
          lastContact: v.lastContact || "",
          nextAction: v.nextAction || "",
          nextDate: v.nextDate || "",
          notes: v.notes || "",
        };
        return change(
          c ? "Datos de cliente actualizados" : "Cliente creado",
          id,
          (s) => ({
            ...s,
            customers: c
              ? s.customers.map((x) => (x.id === id ? next : x))
              : [...s.customers, next],
          }),
        );
      },
    });
  }
  function task(
    t?: Task,
    customerId = "",
    related: { caseId?: string; paymentId?: string; leadId?: string } = {},
  ) {
    open({
      title: t ? "Editar tarea" : "Crear próxima acción",
      fields: [
        text("title", "Próxima acción", true),
        choice(
          "customerId",
          "Cliente",
          [
            { value: "", label: "Sin cliente · prospecto / interna" },
            ...customerOptions,
          ],
          false,
        ),
        choice("leadId", "Prospecto relacionado", leadOptions, false),
        choice("type", "Tipo de tarea", [
          "Seguimiento",
          "Cobranza",
          "VIP / retención",
          "Investigación",
          "Facturación",
          "Outreach",
          "Revisión",
        ]),
        choice("priority", "Prioridad", priorityOptions),
        choice("owner", "Responsable", owners),
        date("due", "Fecha límite", true),
        choice("status", "Estado", taskStatuses),
        choice(
          "caseId",
          "Caso relacionado",
          [
            { value: "", label: "Sin caso" },
            ...state.cases
              .filter((x) => !customerId || x.customerId === customerId)
              .map((x) => ({ value: x.id, label: `${x.id} · ${x.title}` })),
          ],
          false,
        ),
        choice(
          "paymentId",
          "Pago relacionado",
          [
            { value: "", label: "Sin pago" },
            ...state.payments
              .filter((x) => !customerId || x.customerId === customerId)
              .map((x) => ({ value: x.id, label: x.reference })),
          ],
          false,
        ),
        {
          key: "recurrence",
          label: "Repetir cada N días",
          type: "number",
          min: 0,
          max: 365,
          hint: "0 = no repetir. La siguiente tarea se crea al completar esta.",
        },
      ],
      initial: t
        ? stringValues(t)
        : {
            title: "",
            customerId,
            leadId: related.leadId || "",
            caseId: related.caseId || "",
            paymentId: related.paymentId || "",
            type: related.leadId ? "Outreach" : "Seguimiento",
            priority: "medium",
            owner: owners[0],
            due: state.config.referenceDate,
            status: "Por hacer",
            recurrence: "0",
          },
      validate: (v) =>
        !Number.isInteger(Number(v.recurrence))
          ? "El intervalo de repetición debe ser un número entero."
          : v.caseId &&
              state.cases.find((x) => x.id === v.caseId)?.customerId !==
                v.customerId
            ? "El caso y el cliente deben coincidir."
            : v.paymentId &&
                state.payments.find((x) => x.id === v.paymentId)?.customerId !==
                  v.customerId
              ? "El pago y el cliente deben coincidir."
              : state.leads.find((x) => x.id === v.leadId)?.stage ===
                    "No contactar" && v.type === "Outreach"
                ? "No se puede programar outreach para un prospecto marcado No contactar."
                : "",
      submit: (v) => {
        const id = t?.id || uid("TASK");
        const next: Task = {
          id,
          title: v.title,
          customerId: v.customerId || "",
          leadId: v.leadId || "",
          type: v.type,
          priority: v.priority as Task["priority"],
          owner: v.owner,
          due: v.due,
          status: v.status === "Completada" ? "Por hacer" : v.status,
          caseId: v.caseId || "",
          paymentId: v.paymentId || "",
          recurrence: Number(v.recurrence || 0),
        };
        return change(
          t ? "Tarea actualizada" : "Próxima acción creada",
          id,
          (s) => {
            const updated = {
              ...s,
              tasks: t
                ? s.tasks.map((x) => (x.id === id ? next : x))
                : [...s.tasks, next],
              customers: s.customers.map((c) =>
                c.id === v.customerId &&
                !["Completada", "Cancelada"].includes(v.status)
                  ? { ...c, nextAction: v.title, nextDate: v.due }
                  : c,
              ),
            };
            const result =
              v.status === "Completada" ? completeTask(updated, id) : updated;
            if (["Completada", "Cancelada"].includes(v.status) && t) {
              const nextTask = result.tasks
                .filter(
                  (x) =>
                    x.customerId === t.customerId &&
                    !["Completada", "Cancelada"].includes(x.status),
                )
                .sort((a, b) => a.due.localeCompare(b.due))[0];
              return {
                ...result,
                customers: result.customers.map((c) =>
                  c.id === t.customerId && c.nextAction === t.title
                    ? {
                        ...c,
                        nextAction: nextTask?.title || "",
                        nextDate: nextTask?.due || "",
                      }
                    : c,
                ),
              };
            }
            return result;
          },
        );
      },
    });
  }
  function issue(c?: Case, customerId = "") {
    open({
      title: c ? `${c.id} · Detalle del caso` : "Abrir un caso",
      fields: [
        text("title", "Título del caso", true),
        choice("customerId", "Cliente", customerOptions),
        choice("category", "Categoría", categories),
        choice("priority", "Prioridad", priorityOptions),
        choice("status", "Estado", caseStatuses),
        choice("owner", "Responsable", owners),
        date("nextUpdate", "Próxima actualización"),
        area("description", "Descripción", true),
        area("facts", "Hechos comprobados"),
        area("hypothesis", "Hipótesis · por investigar"),
        area("evidence", "Enlaces de evidencia · uno por línea"),
        area("customerStatus", "Estado visible para el cliente"),
        area("resolution", "Resumen de resolución"),
      ],
      initial: c
        ? { ...stringValues(c), evidence: c.evidence.join("\n") }
        : {
            customerId: customerId || state.customers[0]?.id || "",
            category: categories[0],
            priority: "medium",
            status: "Abierto",
            owner: owners[0],
            nextUpdate: state.config.referenceDate,
          },
      note: "Registrar un caso no reporta contenido a un sistema externo. Los hechos y las hipótesis se guardan por separado.",
      validate: (v) =>
        v.evidence
          ?.split("\n")
          .filter((x) => x.trim())
          .some((x) => !safeLink(x.trim()))
          ? "Usá enlaces completos http(s), uno por línea."
          : v.status === "Resuelto" && !v.resolution?.trim()
            ? "Documentá la resolución antes de cerrar el caso."
            : v.status !== "Resuelto" && !v.nextUpdate
              ? "Un caso abierto necesita una próxima actualización."
              : "",
      submit: (v) => {
        const id = c?.id || uid("CASE");
        const next: Case = {
          id,
          customerId: v.customerId,
          title: v.title,
          description: v.description,
          category: v.category,
          priority: v.priority as Case["priority"],
          status: v.status,
          owner: v.owner,
          created: c?.created || state.config.referenceDate,
          updated: state.config.referenceDate,
          nextUpdate: v.status === "Resuelto" ? "" : v.nextUpdate,
          facts: v.facts || "",
          hypothesis: v.hypothesis || "",
          evidence:
            v.evidence
              ?.split("\n")
              .map((x) => x.trim())
              .filter(Boolean) || [],
          customerStatus: v.customerStatus || "",
          resolution: v.resolution || "",
          resolvedAt:
            v.status === "Resuelto"
              ? c?.resolvedAt || state.config.referenceDate
              : "",
        };
        return change(c ? "Caso actualizado" : "Caso abierto", id, (s) => ({
          ...s,
          cases: c
            ? s.cases.map((x) => (x.id === id ? next : x))
            : [...s.cases, next],
        }));
      },
    });
  }
  function escalation(e?: Escalation, customerId = "", caseId = "") {
    open({
      title: e ? "Actualizar escalación" : "Escalar a revisión",
      fields: [
        choice("customerId", "Cliente", customerOptions),
        choice(
          "caseId",
          "Caso relacionado",
          [
            { value: "", label: "Sin caso" },
            ...state.cases.map((x) => ({
              value: x.id,
              label: `${x.id} · ${x.title}`,
            })),
          ],
          false,
        ),
        area("reason", "Motivo y decisión requerida", true),
        choice("owner", "Responsable de la revisión", owners.slice(1)),
        choice("priority", "Prioridad", priorityOptions),
        date("nextUpdate", "Próxima actualización", true),
        choice("status", "Estado", ["Pendiente", "En revisión", "Cerrada"]),
        {
          key: "approval",
          label: "Requiere aprobación de supervisión",
          type: "checkbox",
        },
      ],
      initial: e
        ? stringValues(e)
        : {
            customerId: customerId || state.customers[0]?.id || "",
            caseId,
            owner: owners[1],
            priority: "high",
            nextUpdate: state.config.referenceDate,
            status: "Pendiente",
            approval: "true",
          },
      note: "[CONFIRM ESCALATION SLA] Esta acción registra una solicitud interna; no aprueba descuentos, créditos o cambios de servicio.",
      validate: (v) =>
        v.caseId &&
        state.cases.find((x) => x.id === v.caseId)?.customerId !== v.customerId
          ? "El caso debe pertenecer al cliente seleccionado."
          : "",
      submit: (v) => {
        const id = e?.id || uid("ESC");
        const next: Escalation = {
          id,
          customerId: v.customerId,
          caseId: v.caseId || "",
          reason: v.reason,
          owner: v.owner,
          priority: v.priority as Escalation["priority"],
          created: e?.created || state.config.referenceDate,
          nextUpdate: v.nextUpdate,
          status: v.status,
          approval: v.approval === "true",
        };
        return change(
          e ? "Escalación actualizada" : "Escalación solicitada",
          id,
          (s) => ({
            ...s,
            escalations: e
              ? s.escalations.map((x) => (x.id === id ? next : x))
              : [...s.escalations, next],
          }),
        );
      },
    });
  }
  function payment(p: Payment, received = false) {
    open({
      title: received
        ? "Registrar pago recibido"
        : "Registrar compromiso de pago",
      fields: received
        ? [
            date("receivedAt", "Fecha de recepción", true),
            area("note", "Referencia / nota de verificación", true),
          ]
        : [
            date("promiseDate", "Fecha acordada con el cliente", true),
            area("promiseText", "Compromiso exacto del cliente", true),
          ],
      initial: received
        ? { receivedAt: state.config.referenceDate }
        : {
            promiseDate: p.promiseDate || state.config.referenceDate,
            promiseText: p.promiseText,
          },
      note: received
        ? `Se registrará la recepción de USD ${p.amount}. Esto no procesa un cargo ni verifica una transacción bancaria. Confirmá el recibo antes de guardar.`
        : "Usá solo una fecha confirmada por el cliente. No ofrecer financiación, descuento ni cambio de servicio.",
      submitLabel: received ? "Confirmar registro" : "Guardar compromiso",
      validate: (v) =>
        received && v.receivedAt > state.config.referenceDate
          ? "La fecha de recepción no puede ser futura."
          : !received && v.promiseDate < state.config.referenceDate
            ? "Para un nuevo compromiso, elegí hoy o una fecha futura."
            : "",
      submit: (v) =>
        change(
          received
            ? "Recepción de pago registrada manualmente"
            : "Compromiso de pago registrado",
          p.id,
          (s) => ({
            ...s,
            payments: s.payments.map((x) =>
              x.id === p.id
                ? {
                    ...x,
                    ...(received
                      ? {
                          status: "Recibido" as const,
                          receivedAt: v.receivedAt,
                          lastPayment: v.receivedAt,
                        }
                      : {
                          promiseDate: v.promiseDate,
                          promiseText: v.promiseText,
                        }),
                  }
                : x,
            ),
            interactions: [
              ...s.interactions,
              {
                id: uid("INT"),
                customerId: p.customerId,
                channel: "Internal note",
                kind: "note",
                date: new Date().toISOString(),
                author: "Toti Gauna",
                text: received
                  ? `Pago ${p.reference} registrado como recibido: USD ${p.amount}. ${v.note}`
                  : `Compromiso ${p.reference}: ${v.promiseDate}. ${v.promiseText}`,
              },
            ],
          }),
        ),
    });
  }
  function lead(l?: Lead) {
    open({
      title: l ? "Editar prospecto" : "Nuevo prospecto",
      fields: [
        text("name", "Nombre", true),
        { key: "email", label: "Email de ejemplo", type: "email" },
        text("platform", "Plataforma", true),
        {
          key: "audience",
          label: "Audiencia aproximada",
          type: "number",
          min: 0,
        },
        text("source", "Origen", true),
        choice("stage", "Etapa", leadStages),
        choice("owner", "Responsable", owners),
        date("lastContact", "Último contacto"),
        date("nextContact", "Próximo contacto"),
        area("pain", "Problema principal"),
        area("objection", "Objeción"),
        area("handoff", "Contexto para ventas / responsable"),
        area("notes", "Notas y permiso para contactar"),
      ],
      initial: l
        ? stringValues(l)
        : {
            platform: "OnlyFans",
            audience: "0",
            source: "Referido",
            stage: "Nuevo",
            owner: owners[0],
            nextContact: state.config.referenceDate,
          },
      validate: (v) =>
        v.stage === "Derivado a ventas" && !v.handoff?.trim()
          ? "Documentá el contexto y el responsable del handoff."
          : v.nextContact && v.lastContact && v.nextContact < v.lastContact
            ? "El próximo contacto no puede ser anterior al último."
            : v.lastContact > state.config.referenceDate
              ? "El último contacto no puede ser futuro."
              : "",
      submit: (v) => {
        const id = l?.id || uid("LEAD");
        const next: Lead = {
          id,
          name: v.name,
          email: v.email || "",
          platform: v.platform,
          audience: Number(v.audience || 0),
          source: v.source,
          pain: v.pain || "",
          objection: v.objection || "",
          stage: v.stage,
          owner: v.owner,
          lastContact: v.lastContact || "",
          nextContact: v.stage === "No contactar" ? "" : v.nextContact || "",
          handoff: v.handoff || "",
          notes: v.notes || "",
        };
        return change(
          l ? "Prospecto actualizado" : "Prospecto creado",
          id,
          (s) => ({
            ...s,
            leads: l
              ? s.leads.map((x) => (x.id === id ? next : x))
              : [...s.leads, next],
            tasks:
              v.stage === "No contactar"
                ? s.tasks.map((t) =>
                    t.leadId === id &&
                    !["Completada", "Cancelada"].includes(t.status)
                      ? { ...t, status: "Cancelada" }
                      : t,
                  )
                : s.tasks,
          }),
        );
      },
    });
  }
  function leadContact(l: Lead) {
    if (l.stage === "No contactar") {
      notify("Este prospecto pidió no ser contactado.");
      return;
    }
    open({
      title: `Registrar outreach · ${l.name}`,
      fields: [
        area("text", "Mensaje / respuesta registrada", true),
        choice(
          "stage",
          "Estado tras el contacto",
          leadStages.filter((x) => x !== "Nuevo"),
        ),
        date("nextContact", "Próximo contacto"),
        area("handoff", "Contexto de handoff a ventas"),
      ],
      initial: {
        stage: l.stage === "Nuevo" ? "Contactado" : l.stage,
        nextContact: addDays(
          state.config.referenceDate,
          state.config.sequenceDays[1] || 3,
        ),
        handoff: l.handoff,
      },
      note: "Registrar solo un contacto realizado externamente. No se enviará un mensaje. La fecha propuesta usa la secuencia de práctica configurable.",
      validate: (v) =>
        v.stage === "Derivado a ventas" && !v.handoff?.trim()
          ? "Incluí contexto y responsable del handoff."
          : v.stage !== "No contactar" &&
              v.nextContact &&
              v.nextContact < state.config.referenceDate
            ? "La próxima fecha debe ser hoy o futura."
            : "",
      submit: (v) =>
        change("Outreach registrado", l.id, (s) => ({
          ...s,
          leads: s.leads.map((x) =>
            x.id === l.id
              ? {
                  ...x,
                  stage: v.stage,
                  lastContact: s.config.referenceDate,
                  nextContact:
                    v.stage === "No contactar" ? "" : v.nextContact || "",
                  handoff: v.handoff || "",
                  notes: `${x.notes}\n${s.config.referenceDate}: ${v.text}`,
                }
              : x,
          ),
          tasks:
            v.stage === "No contactar"
              ? s.tasks.map((t) =>
                  t.leadId === l.id &&
                  !["Completada", "Cancelada"].includes(t.status)
                    ? { ...t, status: "Cancelada" }
                    : t,
                )
              : v.nextContact
                ? [
                    ...s.tasks,
                    {
                      id: uid("TASK"),
                      customerId: "",
                      leadId: l.id,
                      title: `Seguimiento de ${l.name}`,
                      type: "Outreach",
                      priority: "medium",
                      owner: l.owner,
                      due: v.nextContact,
                      status: "Por hacer",
                      caseId: "",
                      paymentId: "",
                      recurrence: 0,
                    },
                  ]
                : s.tasks,
        })),
    });
  }
  function interaction(
    customerId: string,
    kind = "contact",
    collection = false,
  ) {
    open({
      title:
        kind === "note" ? "Agregar nota interna" : "Registrar una interacción",
      fields: [
        choice("customerId", "Cliente", customerOptions),
        choice("kind", "Tipo de registro", [
          { value: "contact", label: "Contacto realizado externamente" },
          { value: "incoming", label: "Mensaje recibido" },
          { value: "note", label: "Nota interna" },
          { value: "draft", label: "Borrador · no enviado" },
        ]),
        choice("channel", "Canal", [
          "Email",
          "WhatsApp",
          "Telegram",
          "Phone",
          "Internal note",
        ]),
        {
          key: "collection",
          label: "Intento de cobranza realizado",
          type: "checkbox",
        },
        area("text", "Contenido", true),
        text("nextAction", "Próxima acción"),
        date("nextDate", "Fecha de seguimiento"),
      ],
      initial: {
        customerId,
        kind,
        collection: String(collection),
        channel:
          kind === "note"
            ? "Internal note"
            : state.customers.find((c) => c.id === customerId)?.preference
                .channel || "Email",
        nextAction: "",
        nextDate: "",
      },
      note: "Los canales externos no están integrados. Un borrador no se envía ni actualiza el último contacto.",
      validate: (v) =>
        (v.nextAction && !v.nextDate) || (!v.nextAction && v.nextDate)
          ? "Completá tanto la acción como la fecha de seguimiento."
          : v.nextDate && v.nextDate < state.config.referenceDate
            ? "El nuevo seguimiento debe ser hoy o futuro."
            : v.collection === "true" && v.kind !== "contact"
              ? "Un intento de cobranza requiere un contacto realizado, no un borrador o una nota."
              : "",
      submit: (v) =>
        change("Interacción registrada", v.customerId, (s) => ({
          ...s,
          interactions: [
            ...s.interactions,
            {
              id: uid("INT"),
              customerId: v.customerId,
              kind: v.kind as "contact" | "incoming" | "note" | "draft",
              channel: v.kind === "note" ? "Internal note" : v.channel,
              text: `${v.collection === "true" ? "[Intento de cobranza] " : ""}${v.text}`,
              date: `${s.config.referenceDate}T${new Date().toISOString().slice(11)}`,
              author:
                v.kind === "incoming"
                  ? s.customers.find((c) => c.id === v.customerId)?.name ||
                    "Cliente"
                  : "Toti Gauna",
            },
          ],
          customers: s.customers.map((c) =>
            c.id === v.customerId
              ? {
                  ...c,
                  lastContact: ["contact", "incoming"].includes(v.kind)
                    ? s.config.referenceDate
                    : c.lastContact,
                  ...(v.nextAction
                    ? { nextAction: v.nextAction, nextDate: v.nextDate }
                    : {}),
                }
              : c,
          ),
          tasks: v.nextAction
            ? [
                ...s.tasks,
                {
                  id: uid("TASK"),
                  customerId: v.customerId,
                  title: v.nextAction,
                  type: "Seguimiento",
                  priority: "medium",
                  owner: owners[0],
                  due: v.nextDate,
                  status: "Por hacer",
                  caseId: "",
                  paymentId: "",
                  leadId: "",
                  recurrence: 0,
                },
              ]
            : s.tasks,
          payments:
            v.kind === "contact" && v.collection === "true"
              ? s.payments.map((p) =>
                  p.customerId === v.customerId && p.status === "Pendiente"
                    ? { ...p, lastAttempt: s.config.referenceDate }
                    : p,
                )
              : s.payments,
        })),
    });
  }
  function raw(r: RawRecord) {
    open({
      title: `Revisión humana · ${r.name}`,
      fields: [
        text("name", "Nombre original"),
        text("phone", "Teléfono original"),
        text("stage", "Etapa original"),
        text("lastContact", "Último contacto · texto de origen"),
        text("nextAction", "Próxima acción"),
        text("nextDate", "Próxima fecha · texto de origen"),
        text("amount", "Monto · texto de origen"),
        area("review", "Decisión / información confirmada", true),
      ],
      initial: stringValues(r),
      note: "Se conservan el antes y el después en el historial. No fusionamos registros ni reinterpretamos fechas o montos automáticamente. Podés usar AAAA-MM-DD para una fecha confirmada.",
      submit: (v) =>
        change("Registro CRM revisado manualmente", r.id, (s) => ({
          ...s,
          rawRecords: s.rawRecords.map((x) =>
            x.id === r.id ? { ...x, ...v } : x,
          ),
        })),
    });
  }
  function playbook(p: Playbook) {
    if (state.config.role !== "supervisor") {
      notify("Para editar una política, usá el rol simulado de supervisión.");
      return;
    }
    open({
      title: p.title,
      fields: [
        area("body", "Contenido / procedimiento", true),
        choice("status", "Estado de confirmación", [
          "Por confirmar",
          "Borrador interno",
          "Confirmado para práctica",
        ]),
      ],
      initial: stringValues(p),
      note: `${p.marker} No representa aprobación o política real de Traqeer.`,
      submit: (v) =>
        change("Playbook de práctica actualizado", p.id, (s) => ({
          ...s,
          playbooks: s.playbooks.map((x) =>
            x.id === p.id ? { ...x, body: v.body, status: v.status } : x,
          ),
        })),
    });
  }
  function discount(c: Customer) {
    open({
      title: "Documentar descuento confirmado",
      fields: [
        area("discount", "Descripción y fuente de confirmación", true),
        date("discountStart", "Inicio confirmado", true),
        date("discountEnd", "Fin confirmado", true),
      ],
      initial: {
        discount: c.subscription.discount,
        discountStart: c.subscription.discountStart,
        discountEnd: c.subscription.discountEnd,
      },
      note: "[SUPERVISOR APPROVAL REQUIRED] Solo registra información de un descuento ya autorizado; no aplica un beneficio.",
      validate: (v) =>
        isISODate(v.discountEnd) && v.discountEnd < v.discountStart
          ? "El fin debe ser posterior o igual al inicio."
          : "",
      submit: (v) =>
        change("Fechas de descuento documentadas", c.id, (s) => ({
          ...s,
          customers: s.customers.map((x) =>
            x.id === c.id
              ? { ...x, subscription: { ...x.subscription, ...v } }
              : x,
          ),
        })),
    });
  }
  function obligation() {
    open({
      title: "Registrar una obligación de pago",
      fields: [
        choice("customerId", "Cliente", customerOptions),
        text("reference", "Referencia de pago", true),
        {
          key: "amount",
          label: "Monto USD",
          type: "number",
          min: 0.01,
          required: true,
        },
        date("due", "Vencimiento original", true),
        date("lastPayment", "Último pago registrado"),
      ],
      initial: {
        customerId: state.customers[0]?.id || "",
        due: state.config.referenceDate,
      },
      note: "Registro manual de una obligación ficticia. No emite una factura ni cobra dinero.",
      validate: (v) =>
        state.payments.some((p) => p.reference === v.reference)
          ? "La referencia ya existe. Revisá el registro original."
          : v.lastPayment > state.config.referenceDate
            ? "El último pago no puede ser futuro."
            : "",
      submit: (v) => {
        const id = uid("PAY");
        return change("Obligación de pago registrada", id, (s) => ({
          ...s,
          payments: [
            ...s.payments,
            {
              id,
              customerId: v.customerId,
              reference: v.reference,
              amount: Number(v.amount),
              due: v.due,
              status: "Pendiente",
              receivedAt: "",
              lastAttempt: "",
              lastPayment: v.lastPayment || "",
              promiseDate: "",
              promiseText: "",
            },
          ],
        }));
      },
    });
  }
  function incident(customerId: string, incident?: Incident) {
    const caseOptions = state.cases
      .filter((c) => c.customerId === customerId)
      .map((c) => ({ value: c.id, label: `${c.id} · ${c.title}` }));
    if (!caseOptions.length) {
      issue(undefined, customerId);
      return;
    }
    open({
      title: incident
        ? "Actualizar incidente de contenido"
        : "Registrar incidente de contenido",
      fields: [
        text("title", "Contenido reportado", true),
        choice("caseId", "Caso asociado", caseOptions),
        text("channel", "Canal / sitio reportado", true),
        date("date", "Fecha del reporte", true),
        {
          key: "recurrence",
          label: "Número de apariciones reportadas",
          type: "number",
          min: 1,
          max: 9999,
          required: true,
        },
        text("evidence", "Enlace de evidencia (opcional)"),
      ],
      initial: incident
        ? stringValues(incident)
        : {
            caseId: caseOptions[0].value,
            date: state.config.referenceDate,
            recurrence: "1",
            channel: "Telegram",
          },
      note: "Registrá hechos reportados por el cliente. No realiza una detección o solicitud de remoción externa.",
      validate: (v) =>
        v.evidence && !safeLink(v.evidence)
          ? "La evidencia necesita un enlace completo http(s)."
          : !Number.isInteger(Number(v.recurrence))
            ? "La cantidad de apariciones debe ser entera."
            : v.date > state.config.referenceDate
              ? "La fecha de reporte no puede ser futura."
              : "",
      submit: (v) => {
        const next: Incident = {
          id: incident?.id || uid("INC"),
          customerId,
          caseId: v.caseId,
          title: v.title,
          channel: v.channel,
          date: v.date,
          recurrence: Number(v.recurrence),
          evidence: v.evidence || "",
        };
        return change(
          incident ? "Incidente actualizado" : "Incidente registrado",
          customerId,
          (s) => ({
            ...s,
            incidents: incident
              ? s.incidents.map((i) => (i.id === next.id ? next : i))
              : [...s.incidents, next],
          }),
        );
      },
    });
  }
  function removal(customerId: string) {
    const incidents = state.incidents.filter(
      (i) => i.customerId === customerId,
    );
    if (!incidents.length) {
      notify("Registrá primero un incidente de contenido.");
      return;
    }
    open({
      title: "Registrar actividad de remoción",
      fields: [
        choice(
          "incidentId",
          "Incidente asociado",
          incidents.map((i) => ({ value: i.id, label: i.title })),
        ),
        date("date", "Fecha de actividad", true),
        {
          key: "count",
          label: "Enlaces removidos registrados",
          type: "number",
          min: 1,
          max: 100000,
          required: true,
        },
        area("source", "Fuente / nota de verificación", true),
      ],
      initial: {
        incidentId: incidents[0].id,
        date: state.config.referenceDate,
        count: "1",
      },
      note: "Actividad manual ficticia. No elimina contenido y no garantiza que no vuelva a circular.",
      validate: (v) =>
        !Number.isInteger(Number(v.count))
          ? "La cantidad de enlaces debe ser entera."
          : v.date > state.config.referenceDate
            ? "La fecha de actividad no puede ser futura."
            : "",
      submit: (v) =>
        change("Actividad de remoción registrada", customerId, (s) => ({
          ...s,
          removals: [
            ...s.removals,
            {
              id: uid("REM"),
              customerId,
              incidentId: v.incidentId,
              date: v.date,
              count: Number(v.count),
            },
          ],
          interactions: [
            ...s.interactions,
            {
              id: uid("INT"),
              customerId,
              kind: "note",
              channel: "Internal note",
              text: `Actividad registrada: ${v.count} remociones. Fuente: ${v.source}`,
              date: `${v.date}T12:00:00Z`,
              author: "Toti Gauna",
            },
          ],
        })),
    });
  }
  return {
    customer,
    task,
    issue,
    escalation,
    payment,
    obligation,
    lead,
    leadContact,
    interaction,
    raw,
    playbook,
    discount,
    incident,
    removal,
    change,
    readonly,
    modal: form ? (
      <Modal title={form.title} onClose={() => setForm(null)} wide>
        <EntityForm {...form} onCancel={() => setForm(null)} />
      </Modal>
    ) : null,
  };
}
export type Forms = ReturnType<typeof useForms>;
