import { test, expect } from "@playwright/test";
const key = "traqeer.operations.v1";
const stored = async (page: import("@playwright/test").Page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), key);
test("create a follow-up, complete it, and retain the result and audit after reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nueva acción", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Próxima acción", exact: true })
    .fill("Confirmar fecha concreta de pago");
  await page.getByRole("button", { name: "Cliente", exact: true }).click();
  await page.getByRole("option", { name: "María Torres" }).click();
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Guardado");
  let s = await stored(page);
  const task = s.tasks.find(
    (t: { title: string }) => t.title === "Confirmar fecha concreta de pago",
  );
  expect(task.customerId).toBe("TQ-1001");
  await page.reload();
  await page
    .getByRole("button", { name: "Tareas", exact: false })
    .first()
    .click();
  await page
    .getByRole("button", {
      name: "Completar Confirmar fecha concreta de pago",
      exact: true,
    })
    .click();
  s = await stored(page);
  expect(s.tasks.find((t: { id: string }) => t.id === task.id).status).toBe(
    "Completada",
  );
  expect(s.audit.length).toBe(2);
});
test("customer contact edits persist and are audited", async ({ page }) => {
  await page.goto("/#customers");
  await page
    .getByRole("button", { name: "Abrir Vale Romero", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Editar cliente", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("vale.confirmed@creator.example");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  const s = await stored(page);
  expect(
    s.customers.find((c: { id: string }) => c.id === "TQ-1008").email,
  ).toBe("vale.confirmed@creator.example");
  expect(s.audit[0].action).toContain("cliente");
});
test("record a payment promise then receipt without processing a transaction", async ({
  page,
}) => {
  await page.goto("/#payments");
  await page
    .getByRole("button", { name: "Compromiso", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", {
      name: "Fecha acordada con el cliente",
      exact: true,
    })
    .fill("2026-10-12");
  await page
    .getByRole("textbox", {
      name: "Compromiso exacto del cliente",
      exact: true,
    })
    .fill("Pagaré 89 dólares el 12 de octubre.");
  await page
    .getByRole("button", { name: "Guardar compromiso", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Registrar pago", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", {
      name: "Referencia / nota de verificación",
      exact: true,
    })
    .fill("Comprobante ficticio revisado");
  await page
    .getByRole("button", { name: "Confirmar registro", exact: true })
    .click();
  const s = await stored(page);
  expect(s.payments[0].status).toBe("Recibido");
  expect(s.payments[0].promiseDate).toBe("2026-10-12");
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Balance vencido/ }),
  ).toContainText("$178");
});
test("drafts do not update last contact; an external interaction creates its follow-up", async ({
  page,
}) => {
  await page.goto("/#communication");
  await page
    .getByRole("textbox", { name: "Contenido de comunicación", exact: true })
    .fill("I understand the frustration. I will provide a concrete update.");
  await page
    .getByRole("button", { name: "Guardar borrador", exact: true })
    .click();
  let s = await stored(page);
  expect(s.interactions.at(-1).kind).toBe("draft");
  expect(
    s.customers.find((c: { id: string }) => c.id === "TQ-1002").lastContact,
  ).toBe("2026-10-07");
  await page
    .getByRole("button", { name: "Tipo de comunicación", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Contacto realizado", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Contenido de comunicación", exact: true })
    .fill("Update recorded after external email.");
  await page
    .getByRole("textbox", {
      name: "Próxima acción de comunicación",
      exact: true,
    })
    .fill("Revisar evidencia de Alex");
  await page
    .getByRole("textbox", {
      name: "Fecha de seguimiento de comunicación",
      exact: true,
    })
    .fill("2026-10-09");
  await page
    .getByRole("button", { name: "Registrar interacción", exact: true })
    .click();
  s = await stored(page);
  expect(
    s.customers.find((c: { id: string }) => c.id === "TQ-1002").lastContact,
  ).toBe("2026-10-08");
  expect(s.tasks.at(-1).title).toBe("Revisar evidencia de Alex");
});
test("review a CRM defect explicitly and retain before/after snapshots", async ({
  page,
}) => {
  await page.goto("/#quality");
  const row = page.getByRole("row").filter({ hasText: "Vanessa R." });
  await row.getByRole("button", { name: "Revisar", exact: true }).click();
  await page
    .getByRole("textbox", {
      name: "Último contacto · texto de origen",
      exact: true,
    })
    .fill("2026-02-28");
  await page
    .getByRole("textbox", {
      name: "Decisión / información confirmada",
      exact: true,
    })
    .fill("Fecha confirmada para este ejercicio.");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  const s = await stored(page);
  expect(s.rawRecords[3].lastContact).toBe("2026-02-28");
  expect(s.audit[0].before.rawRecords[0].lastContact).toBe("31/02/2026");
});
test("do-not-contact cancels lead outreach tasks and blocks contact", async ({
  page,
}) => {
  await page.goto("/#outreach");
  const row = page.getByRole("row").filter({ hasText: "Romina Acosta" });
  await row
    .getByRole("button", { name: "Editar / derivar", exact: true })
    .click();
  await page.getByRole("button", { name: "Etapa", exact: true }).click();
  await page.getByRole("option", { name: "No contactar", exact: true }).click();
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  const s = await stored(page);
  expect(s.leads[0].nextContact).toBe("");
  expect(s.tasks.find((t: { id: string }) => t.id === "TASK-009").status).toBe(
    "Cancelada",
  );
  await expect(
    row.getByRole("button", { name: "Registrar contacto", exact: true }),
  ).toBeDisabled();
});
test("role simulation can return from read-only and storage corruption is never silently replaced", async ({
  page,
}) => {
  await page.goto("/#settings");
  await page.getByRole("button", { name: "Rol simulado", exact: true }).click();
  await page
    .getByRole("option", { name: "Solo consulta", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Nueva acción", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Rol simulado", exact: true }).click();
  await page.getByRole("option", { name: "Operador", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Nueva acción", exact: true }),
  ).toBeEnabled();
  await page.evaluate((k) => localStorage.setItem(k, "{broken"), key);
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "datos originales se conservan",
  );
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    "{broken",
  );
});
test("search finds payment references; mobile routes render without page overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /Buscar en Traqeer/ }).click();
  await page
    .getByRole("textbox", { name: "Búsqueda global", exact: true })
    .fill("INV-MARIA-AUG");
  await page.getByRole("button", { name: /INV-MARIA-AUG/ }).click();
  await expect(
    page.getByRole("heading", { name: "María Torres", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "overview",
    "customers",
    "tasks",
    "cases",
    "payments",
    "escalations",
    "outreach",
    "communication",
    "quality",
    "analytics",
    "playbooks",
    "audit",
    "settings",
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("record content activity and close a case with an explicit resolution", async ({
  page,
}) => {
  await page.goto("/#customers");
  await page
    .getByRole("button", { name: "Abrir Sofía Luna", exact: true })
    .click();
  await page.getByRole("tab", { name: "Protección", exact: true }).click();
  await page.getByRole("button", { name: "Actividad", exact: true }).click();
  await page
    .getByRole("spinbutton", {
      name: "Enlaces removidos registrados",
      exact: true,
    })
    .fill("4");
  await page
    .getByRole("textbox", {
      name: "Fuente / nota de verificación",
      exact: true,
    })
    .fill("Registro ficticio de investigación");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  let s = await stored(page);
  expect(s.removals.at(-1).count).toBe(4);
  expect(s.removals.at(-1).customerId).toBe("TQ-1003");
  await page.getByRole("tab", { name: /Casos/ }).click();
  await page.getByRole("button", { name: "Revisar caso", exact: true }).click();
  await page.getByRole("button", { name: "Estado", exact: true }).click();
  await page.getByRole("option", { name: "Resuelto", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Resumen de resolución", exact: true })
    .fill(
      "Investigación registrada y actualización al cliente confirmada para el ejercicio.",
    );
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  s = await stored(page);
  expect(s.cases.find((c: { id: string }) => c.id === "CASE-002").status).toBe(
    "Resuelto",
  );
  expect(
    s.cases.find((c: { id: string }) => c.id === "CASE-002").resolvedAt,
  ).toBe("2026-10-08");
});
test("collection attempts do not invent financial terms and new obligations persist", async ({
  page,
}) => {
  await page.goto("/#payments");
  await page
    .getByRole("button", { name: "Nueva obligación", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Referencia de pago", exact: true })
    .fill("INV-PRACTICE-001");
  await page
    .getByRole("spinbutton", { name: "Monto USD", exact: true })
    .fill("45");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  expect((await stored(page)).payments.at(-1).reference).toBe(
    "INV-PRACTICE-001",
  );
  await page
    .getByRole("button", { name: /María Torres/ })
    .first()
    .click();
  await page.getByRole("tab", { name: "Pagos", exact: true }).click();
  await page
    .getByRole("button", { name: "Intento de cobranza", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Contenido", exact: true })
    .fill("Solicité una fecha concreta sin ofrecer financiación.");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  const s = await stored(page);
  expect(s.payments[0].lastAttempt).toBe("2026-10-08");
  expect(s.payments[0].promiseDate).toBe("");
  expect(s.customers[0].account.status).toBe("Activo");
});
