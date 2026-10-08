import { useState } from "react";
import type { Customer } from "./model";
import {
  activeTask,
  dateLabel,
  healthLabels,
  money,
  overdue,
  priorityLabels,
  promiseStatus,
  safeLink,
} from "./model";
import { useStore } from "./store";
import { Avatar, Badge, Button, Empty, Icon, Modal } from "./components";
import type { Forms } from "./forms";
export function Timeline({ customerId }: { customerId: string }) {
  const { state } = useStore();
  const events = [
    ...state.interactions
      .filter((x) => x.customerId === customerId)
      .map((x) => ({
        id: x.id,
        date: x.date,
        icon: x.kind === "note" ? "note" : "communication",
        title:
          x.kind === "draft"
            ? "Borrador guardado · no enviado"
            : x.kind === "incoming"
              ? "Mensaje del cliente"
              : x.kind === "note"
                ? "Nota interna"
                : "Contacto registrado",
        text: x.text,
        meta: `${x.author} · ${x.channel}`,
        draft: x.kind === "draft",
      })),
    ...state.payments
      .filter((x) => x.customerId === customerId && x.status === "Recibido")
      .map((x) => ({
        id: x.id,
        date: x.receivedAt,
        icon: "payments",
        title: "Pago recibido · registro manual",
        text: `${money(x.amount)} · ${x.reference}`,
        meta: "Recepción registrada",
        draft: false,
      })),
    ...state.escalations
      .filter((x) => x.customerId === customerId)
      .map((x) => ({
        id: x.id,
        date: x.created,
        icon: "flag",
        title: "Escalación interna",
        text: x.reason,
        meta: `${x.id} · ${x.owner}`,
        draft: false,
      })),
    ...state.incidents
      .filter((x) => x.customerId === customerId)
      .map((x) => ({
        id: x.id,
        date: x.date,
        icon: "link",
        title: "Incidente de contenido",
        text: `${x.title}. Reportes registrados: ${x.recurrence}.`,
        meta: x.channel,
        draft: false,
      })),
    ...state.audit
      .filter(
        (x) =>
          x.entity === customerId ||
          state.tasks.some(
            (t) => t.id === x.entity && t.customerId === customerId,
          ) ||
          state.cases.some(
            (c) => c.id === x.entity && c.customerId === customerId,
          ) ||
          state.payments.some(
            (p) => p.id === x.entity && p.customerId === customerId,
          ) ||
          state.escalations.some(
            (e) => e.id === x.entity && e.customerId === customerId,
          ),
      )
      .map((x) => ({
        id: x.id,
        date: x.date,
        icon: "audit",
        title: x.action,
        text: "Cambio registrado en el historial local.",
        meta: x.actor,
        draft: false,
      })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return events.length ? (
    <div className="timeline">
      {events.map((e) => (
        <div
          className={`timeline-item ${e.draft ? "draft-event" : ""}`}
          key={e.id}
        >
          <span className="timeline-icon">
            <Icon name={e.icon} size={16} />
          </span>
          <div>
            <div className="timeline-title">
              <strong>{e.title}</strong>
              <time>{dateLabel(e.date)}</time>
            </div>
            <p>{e.text}</p>
            <small>{e.meta}</small>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Empty
      title="Aún no hay interacciones"
      text="Registrá el primer contacto o una nota interna."
    />
  );
}
export default function Customer360({
  customer: c,
  forms,
  onClose,
  onCommunicate,
}: {
  customer: Customer;
  forms: Forms;
  onClose: () => void;
  onCommunicate: (id: string) => void;
}) {
  const { state } = useStore();
  const [tab, setTab] = useState("Resumen");
  const [reveal, setReveal] = useState(false);
  const payments = state.payments.filter((p) => p.customerId === c.id);
  const tasks = state.tasks.filter(
    (t) => t.customerId === c.id && activeTask(t),
  );
  const issues = state.cases.filter((x) => x.customerId === c.id);
  const escalations = state.escalations.filter((x) => x.customerId === c.id);
  const incidents = state.incidents.filter((x) => x.customerId === c.id);
  const removalCount = state.removals
    .filter(
      (x) =>
        x.customerId === c.id &&
        x.date.slice(0, 7) === state.config.referenceDate.slice(0, 7) &&
        x.date <= state.config.referenceDate,
    )
    .reduce((n, x) => n + x.count, 0);
  return (
    <Modal title="Customer 360°" onClose={onClose} drawer>
      <div className="profile-hero">
        <Avatar name={c.name} size="large" />
        <div>
          <div className="profile-name">
            <h1>{c.name}</h1>
            {c.vip && (
              <Badge tone="vip">
                <Icon name="vip" size={13} /> VIP
              </Badge>
            )}
          </div>
          <p>
            {c.id} <span>·</span> {c.platforms.join(" / ")}
          </p>
        </div>
        <Button
          variant="icon"
          title="Editar cliente"
          icon="edit"
          disabled={forms.readonly}
          onClick={() => forms.customer(c)}
        />
      </div>
      <div className="profile-badges">
        <Badge tone={c.health}>{healthLabels[c.health]}</Badge>
        <Badge>{c.account.status}</Badge>
        <Badge>{c.sentiment}</Badge>
      </div>
      <div className="profile-next">
        <Icon name="clock" />
        <div>
          <span>Próximo paso</span>
          <strong>{c.nextAction || "Sin próxima acción registrada"}</strong>
          <small>
            {c.nextDate
              ? `${dateLabel(c.nextDate)} · ${overdue(c.nextDate, state.config.referenceDate) ? "Seguimiento vencido" : "Programado"}`
              : "Confirmar si corresponde un seguimiento"}
          </small>
        </div>
      </div>
      <div className="profile-actions">
        <Button icon="communication" onClick={() => onCommunicate(c.id)}>
          Abrir conversación
        </Button>
        <Button
          variant="secondary"
          icon="plus"
          onClick={() => forms.task(undefined, c.id)}
          disabled={forms.readonly}
        >
          Acción
        </Button>
        <Button
          variant="secondary"
          icon="flag"
          onClick={() => forms.escalation(undefined, c.id)}
          disabled={forms.readonly}
        >
          Escalar
        </Button>
      </div>
      <div className="tabs" role="tablist" aria-label="Detalle de cliente">
        {["Resumen", "Actividad", "Casos", "Protección", "Pagos"].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tab}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Casos" && (
              <span>
                {issues.filter((i) => i.status !== "Resuelto").length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="profile-body" role="tabpanel" aria-label={tab}>
        {tab === "Resumen" && (
          <>
            <div className="profile-kpis">
              <div>
                <span>Valor mensual</span>
                <strong>{money(c.subscription.monthly)}</strong>
              </div>
              <div>
                <span>Balance pendiente</span>
                <strong>
                  {money(
                    payments
                      .filter((p) => p.status === "Pendiente")
                      .reduce((n, p) => n + p.amount, 0),
                  )}
                </strong>
              </div>
              <div>
                <span>Casos abiertos</span>
                <strong>
                  {issues.filter((i) => i.status !== "Resuelto").length}
                </strong>
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-title">
                <h3>Identidad y contacto</h3>
                <Button
                  variant="ghost"
                  icon={reveal ? "lock" : "eye"}
                  onClick={() => setReveal(!reveal)}
                >
                  {reveal ? "Ocultar" : "Revelar contacto"}
                </Button>
              </div>
              <dl className="detail-grid">
                <div>
                  <dt>Email</dt>
                  <dd>{reveal ? c.email || "Sin email" : "••••••@••••••"}</dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    {reveal ? c.phone || "Sin teléfono" : "+•• •••• ••••"}
                  </dd>
                </div>
                <div>
                  <dt>Plataforma / usuario</dt>
                  <dd>{c.handle || "Sin usuario"}</dd>
                </div>
                <div>
                  <dt>Responsable</dt>
                  <dd>{c.owner}</dd>
                </div>
                <div>
                  <dt>Idioma</dt>
                  <dd>{c.language}</dd>
                </div>
                <div>
                  <dt>Zona horaria</dt>
                  <dd>{c.timezone}</dd>
                </div>
                <div>
                  <dt>Cliente desde</dt>
                  <dd>{dateLabel(c.account.since)}</dd>
                </div>
                <div>
                  <dt>Último contacto</dt>
                  <dd>{dateLabel(c.lastContact)}</dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd>{c.subscription.plan}</dd>
                </div>
                <div>
                  <dt>Canal preferido</dt>
                  <dd>{c.preference.channel} · por confirmar</dd>
                </div>
              </dl>
              <p className="muted small">
                Datos ficticios. Ocultar contacto limita la exposición visual;
                no reemplaza permisos reales.
              </p>
            </div>
            {c.subscription.discount && (
              <div className="notice warning">
                <Icon name="payments" />
                <div>
                  <strong>Descuento pendiente de revisión</strong>
                  <p>{c.subscription.discount}</p>
                  <p>
                    {c.subscription.discountStart && c.subscription.discountEnd
                      ? `${dateLabel(c.subscription.discountStart)} → ${dateLabel(c.subscription.discountEnd)}${overdue(c.subscription.discountEnd, state.config.referenceDate) ? " · Vencido" : ""}`
                      : "Inicio y vencimiento sin confirmar"}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => forms.discount(c)}
                    disabled={forms.readonly}
                  >
                    Documentar fechas autorizadas
                  </Button>
                </div>
              </div>
            )}
            <div className="detail-section">
              <h3>Preferencias y contexto</h3>
              <p>{c.preference.notes || "Sin preferencias adicionales."}</p>
              <p>{c.notes || "Sin notas."}</p>
              <Button
                variant="ghost"
                icon="note"
                onClick={() => forms.interaction(c.id, "note")}
                disabled={forms.readonly}
              >
                Agregar nota interna
              </Button>
            </div>
            <div className="detail-section">
              <div className="detail-title">
                <h3>
                  Próximas acciones{" "}
                  <span className="muted">{tasks.length}</span>
                </h3>
                <Button
                  variant="ghost"
                  icon="plus"
                  onClick={() => forms.task(undefined, c.id)}
                  disabled={forms.readonly}
                >
                  Crear
                </Button>
              </div>
              {tasks.map((t) => (
                <button
                  className="mini-task"
                  key={t.id}
                  onClick={() => forms.task(t)}
                >
                  <span>
                    <strong>{t.title}</strong>
                    <small>
                      {t.owner} · {t.status}
                    </small>
                  </span>
                  <Badge
                    tone={
                      overdue(t.due, state.config.referenceDate)
                        ? "high"
                        : "neutral"
                    }
                  >
                    {dateLabel(t.due)}
                  </Badge>
                </button>
              ))}
            </div>
            {escalations.length > 0 && (
              <div className="detail-section">
                <h3>Escalaciones</h3>
                {escalations.map((e) => (
                  <button
                    className="mini-task"
                    key={e.id}
                    onClick={() => forms.escalation(e)}
                  >
                    <span>
                      <strong>
                        {e.id} · {e.owner}
                      </strong>
                      <small>{e.reason}</small>
                    </span>
                    <Badge tone={e.priority}>{e.status}</Badge>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {tab === "Actividad" && (
          <>
            <div className="detail-title">
              <h3>Historia del cliente</h3>
              <Button
                variant="secondary"
                icon="plus"
                onClick={() => forms.interaction(c.id)}
                disabled={forms.readonly}
              >
                Registrar
              </Button>
            </div>
            <Timeline customerId={c.id} />
          </>
        )}
        {tab === "Casos" && (
          <>
            <div className="detail-title">
              <h3>Casos e investigaciones</h3>
              <Button
                variant="secondary"
                icon="plus"
                onClick={() => forms.issue(undefined, c.id)}
                disabled={forms.readonly}
              >
                Nuevo caso
              </Button>
            </div>
            {issues.map((i) => (
              <article className="detail-case" key={i.id}>
                <div>
                  <Badge tone={i.priority}>{priorityLabels[i.priority]}</Badge>
                  <span className="muted small">{i.id}</span>
                </div>
                <h3>{i.title}</h3>
                <p>{i.description}</p>
                <dl>
                  <dt>Hechos</dt>
                  <dd>{i.facts || "Sin hechos adicionales registrados"}</dd>
                  <dt>Hipótesis</dt>
                  <dd>{i.hypothesis || "Sin hipótesis registrada"}</dd>
                </dl>
                <p className="muted small">
                  {i.owner} · {i.status} · Actualización:{" "}
                  {dateLabel(i.nextUpdate)}
                </p>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => forms.issue(i)}>
                    Revisar caso
                  </Button>
                  <Button
                    variant="ghost"
                    icon="flag"
                    onClick={() => forms.escalation(undefined, c.id, i.id)}
                    disabled={forms.readonly}
                  >
                    Escalar
                  </Button>
                </div>
              </article>
            ))}
            {!issues.length && <Empty title="Sin casos" />}
          </>
        )}
        {tab === "Protección" && (
          <>
            <div className="detail-title">
              <h3>Incidentes y actividad</h3>
              <div className="inline-actions">
                <Button
                  variant="secondary"
                  icon="plus"
                  disabled={forms.readonly}
                  onClick={() => forms.incident(c.id)}
                >
                  Incidente
                </Button>
                <Button
                  variant="secondary"
                  disabled={forms.readonly}
                  onClick={() => forms.removal(c.id)}
                >
                  Actividad
                </Button>
              </div>
            </div>
            <div className="protection-total">
              <span>Remociones registradas este mes</span>
              <strong>{removalCount}</strong>
              <p>
                Actividad ficticia registrada. No confirma la eliminación
                definitiva ni evita una redistribución.
              </p>
            </div>
            {incidents.map((i) => (
              <article className="detail-case" key={i.id}>
                <div>
                  <Badge tone={i.recurrence > 1 ? "high" : "neutral"}>
                    {i.recurrence > 1
                      ? `${i.recurrence} recurrencias`
                      : "Primer reporte"}
                  </Badge>
                  <span className="muted small">{i.channel}</span>
                </div>
                <h3>{i.title}</h3>
                <p>
                  {dateLabel(i.date)} · {i.caseId}
                </p>
                {safeLink(i.evidence) ? (
                  <a
                    href={safeLink(i.evidence)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-link"
                  >
                    <Icon name="link" size={16} /> Evidencia ficticia ·{" "}
                    {i.evidence}
                  </a>
                ) : (
                  <p className="muted">Evidencia pendiente de recopilar</p>
                )}
                <div className="inline-actions">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      forms.issue(
                        state.cases.find((x) => x.id === i.caseId),
                        c.id,
                      )
                    }
                  >
                    Revisar investigación
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={forms.readonly}
                    onClick={() => forms.incident(c.id, i)}
                  >
                    Editar reporte
                  </Button>
                </div>
              </article>
            ))}
            {!incidents.length && <Empty title="Sin incidentes registrados" />}
          </>
        )}
        {tab === "Pagos" && (
          <>
            {payments.map((p) => (
              <article className="detail-case" key={p.id}>
                <div>
                  <Badge tone={p.status === "Recibido" ? "healthy" : "high"}>
                    {p.status}
                  </Badge>
                  <span className="muted small">{p.reference}</span>
                </div>
                <h3>{money(p.amount)}</h3>
                <p>
                  Vencimiento: {dateLabel(p.due)} · Último intento:{" "}
                  {dateLabel(p.lastAttempt)}
                </p>
                <p>
                  {promiseStatus(p, state.config.referenceDate)}
                  {p.promiseDate ? ` · ${dateLabel(p.promiseDate)}` : ""}
                </p>
                {p.promiseText && <blockquote>{p.promiseText}</blockquote>}
                {p.status === "Pendiente" && (
                  <div className="inline-actions">
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
                      onClick={() => forms.interaction(c.id, "contact", true)}
                    >
                      Intento de cobranza
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={forms.readonly}
                      onClick={() => forms.payment(p, true)}
                    >
                      Registrar recepción
                    </Button>
                  </div>
                )}
              </article>
            ))}
            {!payments.length && <Empty title="Sin obligaciones registradas" />}
          </>
        )}
      </div>
    </Modal>
  );
}
