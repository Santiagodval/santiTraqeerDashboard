# Traqeer — Customer Operations workspace

## 1. Vision and master implementation prompt

Build a complete, responsive, action-first Customer Success practice workspace for Traqeer. Its operator manages creator relationships, overdue balances, recurring content incidents, customer promises, internal commitments, and referrals. It is not a general sales CRM. Use the fictional assessment scenarios as the seed dataset, never claim access to actual Traqeer systems. The product answers: **What should I do next, for whom, and why?**

Build with React, TypeScript and Vite, custom reusable interface components and hand-authored SVG charts. Avoid component suites, chart packages, unnecessary dependencies, backend services and invented integrations. Browser localStorage is explicitly requested; treat it as a device-local practice environment, not a secure production database. Keep a versioned validated store, mutation history, recovery state for corrupted storage, cross-tab conflict protection, data export, and a confirmed reset. Never transmit a message, charge a card or perform a takedown. Communication actions save drafts or records of externally performed contacts.

## 2. Operator and scope

Primary persona: a Customer Success / Client Operations employee with limited approval authority. They need to scan risk, prioritize a queue, inspect context, record an interaction, assign an action, and track the result. Secondary persona: a supervisor reviewing escalations and policy placeholders. A role selector is a **simulation**, not authentication or a security boundary.

## 3. Workflows

1. Start the day in Overview: select a risk-ranked item, inspect its customer, record an interaction, and schedule a concrete next action.
2. Collect María's $178 overdue balance: review attempts and the exact quoted reply, ask for a concrete date, record a promise if supplied, create a follow-up, escalate if needed. Do not offer financial terms.
3. Handle a VIP cancellation threat: acknowledge the concern, distinguish 240 recorded removals from an unproven resolution, request evidence, create an escalation with an owner and next update, and record customer-facing commitments.
4. Investigate Sofía's third recurrence: preserve incident evidence and recurrence count, add an internal hypothesis separately from known facts, and assign investigation and next update.
5. Investigate Cami's $89 versus $45 discrepancy without issuing an unauthorized refund. Verify Flor's discount dates without guessing them.
6. Help Agus report content through a **company-confirmation-required** reporting workflow, and capture the referral separately as a lead.
7. Update Vale's requested contact details and preferred delivery channel, preserving an audit trail. WhatsApp delivery availability remains unconfirmed.
8. Outreach Romina: save an initial low-pressure draft, plan a follow-up approximately three days later and a final contact approximately one week after that. These are editable assessment examples, not mandatory company rules. Stop sequence tasks if marked do-not-contact.
9. Review CRM anomalies using raw records; explicitly confirm repairs and duplicate decisions. Never automatically merge or reinterpret ambiguous dates, amounts or phone numbers.

## 4. Information architecture and navigation

Primary: Overview, Customers, Tasks, Cases, Payments, Escalations. Secondary: Outreach, Communications, CRM Health, Analytics, Playbooks. Workspace tools: Settings and Audit history. Customer 360 is a consistent side panel opened from search, tables and queues. Global search includes name, stable ID, contact, platform handle, case ID and payment reference; it opens the relevant customer or view.

## 5. Main dashboard

Small actionable KPI strip: open balance, open cases, due tasks, customer risk. Two-column working area: risk-ranked Today queue (reason, owner, due date, next action), and a customer-health/removal-activity summary. Additional widgets: payment aging, unresolved categories, upcoming commitments, escalations, outreach due and CRM review count. Analytics use only actual fixture/store records. No invented targets, growth percentages or faux live feeds. Reference date defaults to the exercise date, 2026-10-08, and is visibly editable.

## 6. Customer 360

Header: name, stable ID, VIP badge, health, account status. Overview: identity, owner, platforms, language/timezone, contact visibility controls, preferences, subscription, monthly value, outstanding balance, customer since, discount dates/status. Activity: one timeline for messages, calls, payments, notes, tasks and changes. Cases: multiple issues with owner, priority, evidence, customer-facing status and update deadlines. Protection: reported incidents, recurrences and recorded removal actions; no promise that a recorded removal prevents recurrence. Actions: edit profile, record interaction, add task, create case, escalate. Contact changes are audited. Facts and hypotheses have separate fields.

## 7. Tasks

Fields: stable ID, customer, type, description, priority, owner, due date, status, related case/payment/lead, recurring interval (optional, configurable), escalation reference. States: To do, In progress, Waiting for customer, Waiting internally, Completed, Cancelled. Filter by status, priority, owner, date, related entity and text. Completing a recurring task produces one dated successor, never an uncontrolled loop. Record the completion. Cancelling a task does not delete history. A closed case does not silently complete unrelated tasks.

## 8. Cases and escalations

Case: ID, customer ID, category, title, description, known facts, hypothesis, priority, status, owner, created/updated dates, next update, evidence links, internal notes, customer-facing status, escalation ID. Priorities: Critical, High, Medium, Low. Categories cover recurring piracy, billing, discounts, payments, reporting, contact data, privacy/security, dissatisfaction, churn, usability, referral and preferences. Escalation: related customer/case, reason, owner, priority, status, created date, next update, level and approval-required flag. An escalation records a request, not an automatic supervisor approval. No invented SLA.

## 9. Payments

Represent obligations separately from subscriptions and actual receipts. Fields: ID/reference, customer ID, amount USD, original due date, status, paid date, last attempt, next action, promised date and exact commitment, approval-required actions. Aging: Current, 1–7, 8–30, 31–60, 61–90, 90+. Aging is recomputed from the reference date, never stored as a static number. Promise states derive from date/status: no promise, upcoming, due today, missed, fulfilled. Log a payment received **only** as an operator record, not a financial transaction. Preserve original amount and payment history. Discount/refund/credit/financing/suspension/cancellation require confirmed authorized policy and approval; no buttons imply availability.

## 10. Outreach

Lightweight board/list: prospect, platform, audience size, pain point, objection, source, owner, last contact, next contact, stage, handoff. Stages: New, Contacted, No response, Responded, Qualified, Interested, Handoff to Sales, Converted, Not interested, Do not contact. Add/edit a lead, record outreach and response, schedule follow-up, create a sales handoff. No mass messaging. A handoff is an internal record; no assumed sales integration. Referral data should be minimally captured and reviewed for permission to contact.

## 11. CRM health

Keep assessment imports separate from canonical typed customers. Preserve every original cell and row ID. Detect duplicate normalized phone numbers, invalid/impossible dates, mixed or ambiguous date formats, missing fields, next dates before contact, missing actions, overdue actions, ambiguous money strings, non-international phones, inactivity and prolonged stages. Thresholds for inactivity and stage duration are editable assumptions. Duplicate records are a suggestion, not a proven identity match. Review panel supports explicit cell edits and records review notes and changes. Dismissed findings remain in audit history. Invalid data never silently enters balances/charts.

## 12. Playbooks

Editable local placeholders for payment procedures, escalation, VIP handling, billing, discounts, reporting, communication, outreach, privacy and CRM. Each page has status, owner and notes. Default markers: [COMPANY POLICY REQUIRED], [SUPERVISOR APPROVAL REQUIRED], [CONFIRM AUTHORIZED PAYMENT OPTION], [CONFIRM ESCALATION SLA]. Example scripts are drafts, not official policy. No generated policy is presented as approved.

## 13. Communication center

Customer list, channel chooser (Email, WhatsApp, Telegram, Phone, Internal note), conversation timeline, draft editor, record-contact action, internal note and follow-up date/action. Label all external channels as not integrated. Record a customer message or an externally performed contact with actor, timestamp and source. Draft saving must not set last-contact dates. Contact recording updates last contact and, when supplied, creates the next task. Offer case creation/escalation from context. No fake send confirmation. Keep notes distinct from customer messages. Resolve a selected case with a documented reason.

## 14. Alerts and automation

Derived rules: overdue next action, VIP cancellation threat, missed promise, recurring report, duplicate contact, contradictory date, required fields, inactivity and long stage. Visibility toggles and thresholds are editable. Only missed-promise follow-ups may create tasks on explicit operator confirmation; deduplicate by payment/date. Never perform outbound contacts or change service/payment status automatically. Rank critical risk/VIP/overdue before ordinary due dates. Explain ranking and keep each signal legible.

## 15. Analytics

Show active customers, customer health, open/critical cases, unresolved categories, recurrence, balances/aging, receipts, recovery rate with a defined denominator, overdue tasks, escalation age, lead stages/response rate and CRM findings. Resolution duration only from resolved cases with valid timestamps. Retention/churn/reactivation only when status history supports a denominator and observation period; otherwise show “Not enough history”. Removal totals are recorded fixture actions, not verified external results. Charts include accessible labels and textual values.

## 16. Logical model and relationships

All entities use immutable IDs and ISO dates for validated canonical records.

| Entity          | Main fields / relations                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Customer        | identity, email/phone, handle, platform[], ownerId, language, timezone, health, risk, VIP, stage, accountId, lastContact, nextAction/date |
| Account         | customerId, status, since; one customer per account in prototype                                                                          |
| Subscription    | accountId, plan, monthlyValue, currency, discountId                                                                                       |
| Discount        | subscriptionId, description, start/end nullable, confirmation status                                                                      |
| Payment         | customerId/accountId, due, amount, reference, status, promise, receivedAt                                                                 |
| Task            | customerId nullable for leads, caseId/paymentId/leadId optional, due, owner, status, recurrence                                           |
| Interaction     | customerId, channel, direction, text, createdAt, author, kind                                                                             |
| Case            | customerId, category, facts/hypothesis, evidence[], priority, owner, dates, escalationId                                                  |
| Escalation      | customerId, caseId optional, reason, owner, status, priority, nextUpdate                                                                  |
| Lead            | source, prospect, contact, platform, audience, pain/objection, stage, nextContact, sequenceId                                             |
| Sequence        | editable relative-day steps; example 0, 3, 10                                                                                             |
| ContentIncident | customerId/caseId, content label, channel, evidence, reportedAt, recurrence count                                                         |
| RemovalAction   | incidentId/customerId, date, count, recorded source                                                                                       |
| Preference      | customerId, preferred channel, language/timezone, contact restrictions                                                                    |
| InternalNote    | represented by Interaction kind=note, fact/hypothesis flag                                                                                |
| Employee        | local ID, display name, simulated role                                                                                                    |
| AuditLog        | ID, actor, timestamp, entity/type, action, previous/next summary                                                                          |
| RawCRMRecord    | original untrusted strings, review notes; never silently normalized                                                                       |
| Configuration   | referenceDate, thresholds, alert flags, policy content, visibility preference                                                             |

Use simple normalized arrays for independently changing records. Account, subscription and preference can be nested in Customer to avoid pointless CRUD screens while preserving logical boundaries. Enforce valid foreign references on creation/import. Derive totals and display states; do not maintain redundant counts.

## 17. Fictional seed data

- María: active service, $89 monthly, two overdue $89 obligations ($178), first reminder ten days earlier, exact reply “Sí, esta semana lo veo.” This is vague intent, **not** a dated payment promise.
- Alex Morgan: fictional US VIP creator, approximately 300k followers, explicit competitor/cancellation threat, 240 recorded removals this exercise month, unresolved Telegram complaint and urgent escalation.
- Sofía: third recurrence of the same video in the same Telegram channel, frustration, investigation required.
- Cami: disputed $89 charge versus an expected $45, churn concern; do not invent a validated refund.
- Agus: new-site reporting question plus a creator friend referral; no invented upload URL.
- Flor: reported three-month discount with unknown start/end; flag dates for confirmation.
- Meli: screenshot of unknown Telegram group, doubts about plan and perceived value; do not promise an upgrade solves it.
- Vale: outdated email report, requested email change and WhatsApp preference; requested new contact is fictional .example data and not silently applied.
- Romina: fictional prospect, around 300 subscribers, leaked content, concern about generic-content identifiability. Follow-ups are examples.
- Additional low-risk fictional creators show healthy states without burying the actual scenarios.
- Raw CRM exercise contains Carolina M./Caro Molinari with identical phone, Romina T. with 03/15/2026, Vanessa R. with 31/02/2026, Pau G. with ambiguous 1.200 and missing action, Emma W. with next action earlier than last contact. Retain original strings exactly.
- Add a clearly fictional separate concrete missed payment promise to demonstrate that flow without misrepresenting María's reply.

## 18. Visual and interaction requirements

Premium operational SaaS: restrained silver-white surfaces, deep ink navigation, crisp typography, generous alignment, muted teal as the primary accent, amber/coral only for meaningful risk. Distinctive custom Today queue and original SVG visualizations. Avoid giant colored metric cards or decorative graphs unrelated to actual records. All inputs, date picker, select, dialogs, drawer, chart, pills, avatars, toast, filters and command search are authored for this product using semantic primitives. Consistent 8px spacing rhythm, compact metadata and readable body copy. Desktop three-column overview adapts to tablet and phone. No unintended page overflow; tables scroll within their own surface. Respect prefers-reduced-motion; use short purposeful panel transitions and chart entrance animation. Keyboard support, visible focus, Escape to close, trapped dialog focus, no inaccessible icon-only actions. Forms have labels, validation and useful empty states.

## 19. Permissions, privacy and audit

Roles: operator can update simulated customer/contact data, tasks, cases, drafts, payment receipt records and leads. Supervisor simulation can edit policy placeholders, never bypass a missing policy or claim real financial authority. Viewer simulation is read-only. Role selectors and masking are UX practice controls, **not real access enforcement**. Hide contact details by default; revealing is session-only and intentional. No real customer secrets, embedded credentials or external tracking. Browser export intentionally includes local records and requires confirmation. Use fictitious .example contacts and evidence URLs. Audit every durable mutation, recording previous/next data as local change snapshots; it is editable local history, not a tamper-proof compliance system. No legal claims. Production needs authentication, server-side authorization, durable encrypted storage, retention rules and approved integrations.

## 20. Unknowns / configurable policies

Unknown: actual plans/prices, payment options, employee authority, discount rules, suspension/cancellation rules, escalation routing/SLA, reporting endpoint, takedown capabilities, supported channels, privacy obligations, sales handoff workflow. Mark required confirmation. Configurable practice assumptions: exercise date, inactivity period, stage duration, follow-up sequence offsets, recurrence interval, alert visibility, owners and assignment. Seed plan labels/values belong to fictional examples. No numerical business targets.

## 21. Edge cases

Empty datasets, no search results, invalid evidence URL, malformed storage, schema mismatch, storage quota/write refusal, two tabs changing state, browser storage disabled, impossible dates, timezone versus reference-day mismatch, discount dates unknown, multiple cases per customer, no recorded payments, no resolution history, cancelled or completed tasks, do-not-contact prospects, customer deleted while referenced (avoid deletion in MVP), duplicate raw data, zero amounts, overdue promised payment already paid, partial data lacking owner/contact. Present errors, preserve source data, never silently reset corrupt storage. External links open safely. Reference date is a calendar-day practice setting; audit timestamps use real UTC.

## 22. Acceptance criteria

1. All navigation opens useful scenario-specific views with working search/filtering and empty states.
2. Seed fixtures are clearly fictional, all entities have stable IDs, and reload retains changes.
3. Every create/edit/status/contact/payment/escalation action records an audit event with actor/time.
4. María's collection workflow records a contact and concrete follow-up without promising unauthorized terms.
5. VIP cancellation and Sofía's recurrence remain visibly urgent until their statuses change.
6. Case/customer detail show evidence, known facts versus hypotheses, activity and next actions.
7. A concrete payment promise can be recorded and its missed status derives correctly from the reference date; received payment leaves overdue totals.
8. Raw CRM validation identifies every supplied defect and requires human review to change a cell; before/after history remains available.
9. Outreach persists stage/contact/objection/handoff and do-not-contact blocks communication/sequence actions.
10. Communication drafts never pretend to send messages; recorded external contact can schedule a follow-up.
11. Charts and totals reflect current local records, including empty and unavailable metrics.
12. Inputs/select/date-picker/dialogs are custom, keyboard usable, responsive and reduced-motion aware.
13. Storage errors remain visible and preserve the recoverable raw data; data export and reset are explicit.
14. Build and type checks pass. Exercise overdue calculations, data-quality detectors, task recurrence, storage reload and key browser flows with meaningful checks.

## 23. Critical design review

Cut enterprise campaign builders, custom permission designers, sentiment AI, predictive churn scores, multi-currency accounting and elaborate account hierarchies. They add little to an entry-level daily workflow. Keep operational risk **explicitly assigned**, never claim algorithmic churn prediction. Large dashboards can bury urgent actions: keep a ranked queue first and detail on demand. Per-channel tabs imply integrations: label drafts/records clearly. LocalStorage is inspectable and mutable: use fictional data and do not claim production security. Masking is shoulder-surfing protection only. Duplicate auto-merges would destroy source context: require review. Collection automation could violate authority: alert and schedule, never negotiate. Missing workflow: closure must include the customer update/follow-up, and handoffs need an owner and next update. Data quality must remain actionable, not only a score. Reporting must explicitly distinguish repeated unauthorized distribution from a failed prior removal.

## 24. Prioritized scope

**MVP (this frontend):** Today queue, customers/360, tasks, cases/escalations, payments/promises, local communication records/drafts, lightweight leads/handoff, raw CRM review, policy placeholders, configurable alerts/reference date, custom charts, masking, local role simulation, audit, import/export/recovery and complete fictional fixtures.

**Phase 2:** authenticated multi-user backend and authorization, approved channel integrations, approved reporting/takedown integration, verified payment reconciliation, real supervisor approval workflow, attachments with safe storage, richer activity-based retention analytics, automatic deduplicated reminders, server-backed notifications.

**Nice-to-have:** saved personal filters, keyboard shortcuts beyond navigation/search, team workload balancing, advanced sequence experiments, custom report designer. No feature should distract from assigning and fulfilling the next action.
