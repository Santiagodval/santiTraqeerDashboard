import { describe, expect, it } from "vitest";
import {
  activeTask,
  ageBucket,
  completeTask,
  daysBetween,
  isISODate,
  promiseStatus,
  qualityFindings,
  safeLink,
  taskScore,
  validStore,
} from "./model";
import { createSeed } from "./seed";
describe("operational rules", () => {
  it("validates canonical data without changing the original CRM errors", () => {
    const s = createSeed();
    expect(validStore(s)).toBe(true);
    expect(s.rawRecords[3].lastContact).toBe("31/02/2026");
    expect(
      validStore({ ...s, customers: [{ ...s.customers[0], account: null }] }),
    ).toBe(false);
    expect(
      validStore({ ...s, tasks: [{ ...s.tasks[0], customerId: "missing" }] }),
    ).toBe(false);
    expect(
      validStore({ ...s, payments: [{ ...s.payments[0], amount: -1 }] }),
    ).toBe(false);
    expect(
      validStore({ ...s, tasks: [{ ...s.tasks[0], caseId: "CASE-003" }] }),
    ).toBe(false);
    expect(
      validStore({
        ...s,
        customers: [{ ...s.customers[0], nextDate: "2026-02-31" }],
      }),
    ).toBe(false);
  });
  it("rejects impossible dates and handles leap years / UTC calendar days", () => {
    expect(isISODate("2026-02-31")).toBe(false);
    expect(isISODate("2026-02-29")).toBe(false);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(daysBetween("2026-09-28", "2026-10-08")).toBe(10);
  });
  it("keeps vague intent distinct from a dated promise", () => {
    const s = createSeed();
    expect(promiseStatus(s.payments[0], "2026-10-08")).toBe(
      "Sin fecha acordada",
    );
    expect(promiseStatus(s.payments[2], "2026-10-08")).toBe("Incumplido");
    expect(promiseStatus(s.payments[2], "2026-10-06")).toBe("Vence hoy");
    expect(
      promiseStatus({ ...s.payments[2], status: "Recibido" }, "2026-10-08"),
    ).toBe("Cumplido");
  });
  it("assigns every aging boundary correctly", () => {
    expect([-1, 0, 1, 7, 8, 30, 31, 60, 61, 90, 91].map(ageBucket)).toEqual([
      "Al día",
      "Al día",
      "1–7 días",
      "1–7 días",
      "8–30 días",
      "8–30 días",
      "31–60 días",
      "31–60 días",
      "61–90 días",
      "61–90 días",
      "90+ días",
    ]);
  });
  it("prioritizes VIP cancellation risk over ordinary overdue work", () => {
    const s = createSeed();
    expect(taskScore(s.tasks[0], s)).toBeGreaterThan(taskScore(s.tasks[1], s));
  });
  it("flags duplicate contacts, impossible/mixed dates, contradictions, missing actions and ambiguous amounts", () => {
    const findings = qualityFindings(createSeed());
    expect(findings.filter((f) => f.type === "Duplicado")).toHaveLength(2);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-002" && f.message.includes("MM/DD"),
      ),
    ).toBe(true);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-004" && f.type === "Fecha inválida",
      ),
    ).toBe(true);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-005" && f.type === "Monto ambiguo",
      ),
    ).toBe(true);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-006" && f.type === "Contradicción",
      ),
    ).toBe(true);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-005" && f.type === "Acción faltante",
      ),
    ).toBe(true);
  });
  it("requires human edits to remove findings and preserves other defects", () => {
    const s = createSeed();
    const before = JSON.stringify(s);
    const findings = qualityFindings(s);
    expect(JSON.stringify(s)).toBe(before);
    const edited = {
      ...s,
      rawRecords: s.rawRecords.map((r) =>
        r.id === "RAW-004"
          ? {
              ...r,
              lastContact: "2026-02-28",
              review: "Date confirmed in exercise",
            }
          : r,
      ),
    };
    expect(
      qualityFindings(edited).some(
        (f) => f.recordId === "RAW-004" && f.type === "Fecha inválida",
      ),
    ).toBe(false);
    expect(
      findings.some(
        (f) => f.recordId === "RAW-004" && f.type === "Fecha inválida",
      ),
    ).toBe(true);
    expect(
      qualityFindings(edited).some(
        (f) => f.recordId === "RAW-005" && f.type === "Monto ambiguo",
      ),
    ).toBe(true);
  });
  it("creates one recurrence successor and does not duplicate on a retry or reopen", () => {
    const s = createSeed();
    const recurring = s.tasks.find((t) => t.recurrence > 0)!;
    const next = completeTask(s, recurring.id);
    expect(next.tasks).toHaveLength(s.tasks.length + 1);
    expect(next.tasks.at(-1)?.due).toBe("2026-10-19");
    expect(activeTask(next.tasks.find((t) => t.id === recurring.id)!)).toBe(
      false,
    );
    expect(completeTask(next, recurring.id)).toBe(next);
    const reopened = {
      ...next,
      tasks: next.tasks.map((t) =>
        t.id === recurring.id ? { ...t, status: "Por hacer" } : t,
      ),
    };
    expect(completeTask(reopened, recurring.id).tasks).toHaveLength(
      next.tasks.length,
    );
  });
  it("rejects executable evidence URLs", () => {
    expect(safeLink("javascript:alert(1)")).toBe(null);
    expect(safeLink("https://evidence.example/a")).toBeTruthy();
  });
});
