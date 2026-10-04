# ETI CRM backend

The independent CRM at https://crm.etiworld.ae uses Netlify Functions, Identity and site-scoped Netlify Blobs. The public website is a separate deployment. Authentication verifies the request session with Identity. Only the three configured super admins can manage assignment, staff, archive, settings and full backups. Salespeople can access only their assigned records and submit unassigned new leads.

## Endpoints

`/.netlify/functions/crm`:

- GET: current actor, authorised workspace records, settings, integration flags and notification read IDs.
- GET `?view=leads`: search/filter and paginate leads. `q`, `source`, `stage`, `temperature`, `program`, `ownerId`, `from`, `to`, `page`, `limit` (1–200).
- GET `?view=tasks|contacts|accounts|quotations`: authorised paginated records. Tasks accept `leadId`.
- GET `?view=reports`: totals plus salesperson, source, programme, stage and temperature summaries. Creation-date filters use Asia/Dubai.
- GET `?view=export`: filtered CSV with spreadsheet formula escaping.
- GET `?view=audit`: admin audit history, optional `recordId`/`q`, pagination.
- GET `?view=archive`: admin archive directory and pagination.
- GET `?view=backup`: versioned admin JSON backup of leads, tasks, staff directory, settings, archives and audit history. Does not export credentials, session tokens or provider secrets.
- GET `?view=health`: admin connection readiness, delivery-attempt status and storage use. Configuration is not proof of delivery.
- GET `?view=notifications`: this account's read reminder IDs.
- PUT `{kind: "leads" | "tasks", record}`: validated create/update. Existing records require their current `version`.
- PATCH `{enrolmentTarget}`: admin-only workspace target.
- POST: commands below. Each body includes a unique `requestId` and `action`.

Commands:

| Action | Fields | Behaviour |
| --- | --- | --- |
| `import` | `records` (1–500 leads) | Atomic batch, duplicate contact skip, forced unassigned for salespeople |
| `assign` | `records: [{id, version}]`, `ownerId` | Admin-only atomic bulk assignment; activities follow their lead |
| `archive` | `id`, `version` | Admin-only recoverable archive of lead and activities |
| `restore` | `id` | Admin-only restore; duplicate contacts block restoration; disabled owners become unassigned |
| `note` | `id`, `version`, `text` | Append authenticated author/time; immutable previous notes |
| `followup` | `id`, `version`, `followUpAt` | Absolute UTC ISO timestamp or empty string to clear |
| `quotation` | `id`, `version`, `quote` | Validate and save a quotation on an accessible lead |
| `notification.read` | `ids` | Persist reminder read state for this account only |

Commands are deduplicated by actor/request ID for seven days. Reusing an ID with different input returns 409. Failed batches do not partially commit. Client retries after uncertain responses retain the operation ID for the same payload. Writes require same-origin JSON requests; POST/PUT/PATCH bodies are limited to 2 MB. Optimistic versions and conditional storage writes prevent lost updates.

`/.netlify/functions/crm-team`: admin-only directory reconciliation (GET), individual account creation (POST), disable/restore staff access (PATCH). Identity credentials are never stored in CRM records. Existing invited accounts are registered without recreating invitations. Account creation remains dependent on Identity availability.

`/.netlify/functions/crm-website`: token-authenticated Netlify Forms capture.
`/.netlify/functions/crm-meta`: signed Meta lead/WhatsApp webhook and verification.
`/.netlify/functions/crm-reminders`: scheduled external follow-up delivery; disabled until configured.

## Data and operational limits

All related changes commit in one conditionally written workspace object, with strong reads and six conflict retries. Schema version 2 is backward compatible with the existing workspace. Archive and audit data stay in the workspace and are included in backups. There is no destructive delete endpoint. The workspace has an enforced 8 MB capacity; API responses do not expose the full state to salespeople. This storage design is appropriate for the current small deployment; migrate to a transactional database before large-volume use. Backups are manually downloadable; automatic off-site backup/restore and disaster-recovery testing are not implemented.

Provider credentials are configured through Netlify environment variables, never browser forms. Meta/WhatsApp/website ingestion and email/WhatsApp reminders still require provider setup and real delivery tests. No integration is marked operational solely because code exists.

## Verification

Run `npm run typecheck`, `npm test`, and `npm run build`. Tests cover identity-session verification, permission scope, record lifecycle, optimistic conflicts, incoming-event deduplication, form preservation, reminder recipients, atomic imports, operation replay, bulk assignment, archive/restore, server reporting, per-account notification state and HTTP API validation.

### Website enquiry matching and recovery

Public `POST /.netlify/functions/crm-formsubmit` creates a separate opportunity per accepted website submission. `CRM Submission ID` deduplicates delivery retries; email/phone no longer merges distinct website enquiries. Public callers cannot choose owner or stage. Browser CORS allows the two ETI website origins and intake is rate limited.

Authenticated super-admin command `{action:"website.recover",requestId:"<unique ID>"}` returns `{recovered:number}`. It recovers additional submissions previously merged into active leads, retaining original histories and using stable recovery event IDs. Salespeople receive 403. It does not restore archived leads or replay emails.

### Bulk deletion

Super-admin-only command `{action:"delete.bulk",requestId,records:[{id,version}]}` accepts 1–10,000 unique records. Every record and version is checked before the transaction commits. Leads and associated activities are moved to the existing recoverable archive, with per-lead audit entries; notes/quotations remain intact. Response: `{deleted:number}`. Replaying the same requestId is idempotent. Sales accounts receive 403 even when all selected records belong to them.
