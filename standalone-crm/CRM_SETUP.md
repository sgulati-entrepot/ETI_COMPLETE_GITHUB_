# Standalone ETI CRM — deployment boundary

This CRM is now an independent Vite/React application in `standalone-crm`, hosted on Netlify project `entrepot-sales-crm`, site ID `d1a1e505-c9a5-4062-9e57-95b454c3f3ff`, at https://crm.etiworld.ae. Do not deploy it to `entrepotgithub`, alter the marketing website, or reuse that project's Identity users or Blobs storage. Its new Identity service has separate invitations and records. The earlier main-site identity setup documented below is historical and does not grant access to this standalone CRM.

Build: `npm run typecheck && npm test && npm run build`. Deploy only `dist` and this project's `netlify/functions` to the standalone site ID. `npm run dev` serves the independent preview on port 3001. The root and `/crm` both load the CRM, so invitation hash links work without marketing-site changes. The website SEO administration link has been removed because the standalone CRM does not administer the marketing site.

The main website's layout, analytics, chat widget, SEO API and package file have been restored to their prior versions. The main production deployment remains `6abc9e157ea3070008b28270`. Two unsuccessful draft attempts on the website project did not publish.

---

# ETI Sales CRM

The CRM is available at `/crm`. The public website homepage is unchanged. Company branding and programme names were referenced from [etiworld.ae](https://etiworld.ae/).

## What is implemented

- Dashboard with real calculations from the records currently loaded, period selection, source breakdown, pipeline totals, and activity reminders.
- Lead/contact creation and editing; search; source, owner and stage filters; CSV import with duplicate detection; CSV export with formula-injection protection.
- Seven-stage sales pipeline, drag-and-drop stage updates, owners, priorities, expected close dates, AED opportunity values, and timestamped notes.
- Company accounts derived from associated leads, programme views, and enrolment reporting by owner.
- Calls, emails, meetings and follow-up tasks with due dates, completion and reopening.
- Quotations with quantities, unit prices, discount, optional tax, expiry, manually maintained status and printable HTML downloads. Open a downloaded quotation and print/save as PDF in your browser.
- Netlify Identity login, invitation acceptance, password recovery and role checks; Netlify Blobs persistence; per-record version checks and atomic conditional writes.
- Signed Meta Lead Ads and WhatsApp inbound webhooks; authenticated Netlify Forms webhook; contact matching; event deduplication; automatic follow-up tasks.

## Demo and live data

The default demo stores sample records in this browser, under `eti-crm-demo-v1`. All sample names, companies, contacts, prices, owners and sales figures are fictional. Demo data never automatically uploads to the live CRM. Settings provides exports and a demo reset.

Live data starts empty. Individual sales accounts see only leads assigned to their immutable Identity user ID, related contacts/accounts/quotes and their own activities. The server applies the same restriction to reads, edits, reports and exports. Owners cannot be reassigned by salespeople. Disabling staff in Team blocks CRM API access immediately; records remain available to super admins for reassignment.

Three super-admin identities are configured in `app/crm/admin-config.ts`:

- Sajeev Gulati — `sgulati@entrepot.ae`
- Reena — `rdsouza@entrepot.ae`
- Sheetal — `smurthy@entrepot.ae`

Only verified Identity accounts matching these email addresses receive full CRM access. A Functions-only `CRM_SUPER_ADMIN_EMAILS` override can replace the list; it must contain exactly three distinct valid emails. The configuration reserves identities; it does not itself create accounts, passwords, or send messages. The Team page clearly marks demo profiles. Super admins also have access to the existing website SEO administration through Settings.

The requested sales profiles are **Ali — `adanish@entrepot.ae`** and **cnair — `cnair@entrepot.ae`**, configured in `app/crm/staff-config.ts`. They appear in the demo directory and, until provisioned, as **Awaiting login setup** in the live super-admin Team screen. Use **Create login for Ali / cnair** to set their initial passwords through the existing protected staff-creation flow. Configuration alone grants no live permissions and creates no Identity account.

Lead temperature is independent of sales stage and priority: **Hot (red), Warm (amber), Cold (blue)**. It appears on lead tables, pipeline cards, detail views, CSV exports and the edit form. Leads without an existing classification and new integration enquiries default to Warm. Temperature can be filtered in the lead list.

## Hosting and access

This implementation uses the site's existing Netlify architecture. The Next.js frontend can be previewed locally with `npm run dev:netlify`; production functions require Netlify. The project's alternative Cloudflare/Vinext build does not implement these Netlify endpoints.

1. Deploy the site with its existing Netlify build settings. Keep secrets in Netlify's Functions environment, never in `NEXT_PUBLIC_*` variables or the browser.
2. Enable Netlify Identity and set registration to **Invite only**. Configure identity invitation/recovery email links to return to `/crm`.
3. Bootstrap Sajeev's verified account through Netlify Identity (or use his existing verified account). The exact configured email grants the first super admin access; legacy `crm`/`admin` role strings alone no longer grant CRM access.
4. Sign in as Sajeev, open **Team**, and create Reena's and Sheetal's reserved super-admin logins using a strong initial password. If either already has a verified Identity account with the configured address, that person can sign in directly instead. Each account is registered in the staff directory on first sign-in.
5. Use **Add sales staff** to create each person's individual email/password account. Initial passwords must have 12–128 characters and are passed only to Identity, never saved in CRM records, browser storage or API responses. Share them securely outside the app. No invitation or password email is sent by the creation action. Account recovery is available through the login dialog.
6. Assign leads using **Edit lead → Owner**. Existing records assigned only by display name need explicit reassignment to a real account ID; the application deliberately does not guess identity from a name. Related activities move to the new owner when a lead is reassigned. Unassigned integration leads are visible to super admins until assigned.
7. Validate on a Netlify preview: sign in as each salesperson and confirm they cannot retrieve or edit another salesperson's leads/tasks, call the Team endpoint, or reassign records. Test the disabled-account path and all three super admins.

Staff registration and Identity provisioning span two services. If Identity creation succeeds but CRM registration fails, the API reports the partial failure. An administrator must reconcile that Identity account and its CRM team record before retrying; the UI does not claim success or create another password automatically.

Public site tracking is isolated in `app/WebsiteTracking.tsx` and is not rendered on `/crm`. Live responses are marked `Cache-Control: no-store`. No credentials are stored in the CRM settings form.

## Meta Lead Ads

Configure these Functions environment variables:

| Variable | Purpose |
| --- | --- |
| `CRM_META_APP_SECRET` | Meta app secret for payload signature verification |
| `CRM_META_VERIFY_TOKEN` | Strong custom token for webhook verification |
| `CRM_META_PAGE_TOKEN` | Page access token with approved lead retrieval permissions |
| `CRM_META_PAGE_ID` | Authorised Facebook Page ID |
| `CRM_META_GRAPH_VERSION` | Supported API version for your app, in `vNN.N` format |

Set the public callback URL to `https://YOUR_DOMAIN/.netlify/functions/crm-meta`. Subscribe the approved Page/app to `leadgen` events. Facebook and Instagram Lead Ads attached to that Page use this flow. The endpoint retrieves the lead's form fields from the Graph API; form and ad identifiers are written to the lead timeline.

Use Meta's Lead Ads testing tool, confirm one lead and one task in the CRM, then replay the notification and confirm no duplicates. Expired Page tokens or missing permissions return a retryable error. Monitor failed webhook deliveries and rotate credentials through Netlify.

## WhatsApp Business

Use the same app-secret and verify-token variables and callback URL. Set `CRM_WHATSAPP_PHONE_ID` to the authorised Cloud API phone number ID. Subscribe your WhatsApp Business account to `messages` events. If WhatsApp uses a different Meta app, this shared-secret implementation needs a separate endpoint/secret before connecting it.

An inbound message matches an existing phone number or creates a new lead. Text and interactive replies enter the timeline; media events get a descriptive entry, not an attachment download. Delivery receipts are ignored. Outbound messages, templates, broadcasts and a shared WhatsApp inbox are not implemented.

## Website leads

Existing public forms continue posting to Netlify Forms; their submission and email-notification behaviour is retained.

1. Set `CRM_WEBSITE_WEBHOOK_TOKEN` to a strong random secret.
2. In Netlify Forms submission notifications, create an HTTP POST notification for each of `eti-leads-courses` and `eti-leads-programs`.
3. Use `https://YOUR_DOMAIN/.netlify/functions/crm-website?token=YOUR_SECRET`. Treat the full callback URL as a credential and keep it out of screenshots, browser forms, and client code. Server-to-server callers may instead send `Authorization: Bearer YOUR_SECRET`.
4. Submit each existing form type and confirm programme, contact, organisation, note and follow-up mapping. The webhook accepts Netlify's `payload` wrapper or a direct submission object with `id`, `form_name`, and `data`.
5. Repeat the same submission ID and confirm it is processed once.

Capitalised corporate form fields, student registration fields such as `Full name` and `Mobile / WhatsApp`, and lower-case forms are mapped. Preserve an international country code in phone numbers; the CRM removes formatting and recognises an international `00` prefix, but does not infer a missing country code.

## Storage, conflicts and operating limits

The `eti-crm` Blobs store contains one site-scoped `workspace` object. Leads, activities and processed-event IDs are committed together using ETag compare-and-swap. A conflicting user edit returns 409 rather than silently overwriting a newer edit; reload the workspace before retrying. Leads matched ambiguously by email and phone also require manual review.

This is a small-team implementation, not full Zoho CRM parity. Each lead represents one opportunity; contacts and accounts are derived views. There is no separate multi-deal contact model, custom fields/workflow builder, email mailbox sync, invoice/payment collection, soft-delete/archive interface, marketing campaigns or external calendar sync. Quotes use one service line and do not send emails or become tax invoices. Enrolment revenue means enrolled deal value, not cash collected.

The shared store is limited to 8 MB by the application, 1,000 notes and 100 quotations per lead. Move to a transactional relational database with pagination, retention, backup/restore and a webhook job queue before high-volume use. Incoming Meta batches are processed synchronously; delivery failures must be monitored in provider logs. Live configuration indicators check variable presence only and do not certify permission validity or delivery health. Validate live Identity, Blobs and provider delivery on a Netlify preview before enabling production collection.

## Validation

Run:

```sh
node --import tsx --test tests/crm.test.ts
npx tsc -p tsconfig.crm.json --noEmit
npx eslint app/crm netlify/functions/crm*.mts netlify/functions/_shared
npx next build --webpack
```

Automated tests cover event replay, cross-source contact matching, ambiguous matching, signature/token verification, CSV edge cases, record validation, quote validation and real website field mapping. Browser checks cover creation, reload persistence, stage changes, notes, task completion, quotations, CSV duplicate handling and responsive layout. Live Identity provisioning, email/password login and provider integration tests require a Netlify deployment and credentials and have not been run. Tests also cover the three-admin allowlist, verified-email requirements, scoped record reads, cross-owner edit denial, ownership spoofing, task association access, immediate disabled-user denial, staff assignment validation and all three temperatures.

Only super admins can assign, reassign, or unassign leads. Leads created or imported by sales staff remain unassigned and await super admin assignment; sales staff cannot claim them. The owner field is read-only for sales staff, and the server enforces this restriction independently.

## Lead details and follow-ups

New Website and Meta Lead Ads deliveries retain submitted field names and complete values in a read-only submission history, including arrays, numbers, booleans and custom questions. Repeat delivery IDs are deduplicated. History is preserved by ordinary lead edits and cannot be overwritten through the lead editor. Spam/CAPTCHA transport fields are excluded. Limits are 200 fields per submission, 20,000 characters per field and 200 submissions per lead; oversized deliveries are rejected rather than silently truncated. Older deliveries are not backfilled; existing timeline text remains available. WhatsApp text and interactive messages continue to appear in the timeline; attachment files are not imported.

Every lead has Notes & remarks with author and timestamp, and a follow-up date/time that can be saved or cleared. Follow-ups are stored in UTC and displayed in the browser’s labelled local timezone. They do not send email or WhatsApp reminders.

## Follow-up notifications

The CRM bell displays in-app reminders on the calendar day before a lead's follow-up, on its due date, and while overdue. Dates use the same browser timezone as the follow-up editor. Sales staff reminders are scoped to their assigned leads; super admins see all workspace reminders. The bell refreshes every 30 seconds and on window focus, using live records synced every minute. Read status is saved per account on that browser, with separate identities for tomorrow/today/overdue, so reading an early reminder does not suppress the due-day reminder. Changing or clearing a follow-up updates the reminder; Enrolled/Lost leads are excluded. This does not send email, WhatsApp, or background push notifications when the CRM is closed.

## External follow-up delivery (disabled until configured)

`crm-reminders` runs every five minutes on published Netlify deploys. At or after 09:00 in `CRM_REMINDER_TIMEZONE` (default Asia/Dubai), it queues one reminder on the calendar day before and one on the follow-up date. Active assigned sales staff receive email, with all configured super admins in CC. WhatsApp copies are separate messages to the salesperson and each admin. Unassigned leads and Enrolled/Lost leads are excluded.

Set Functions-only variables: `CRM_REMINDERS_ENABLED=true` only after testing; `CRM_RESEND_API_KEY`, `CRM_REMINDER_FROM` (verified sender); `CRM_WHATSAPP_ACCESS_TOKEN`, `CRM_WHATSAPP_PHONE_ID`, `CRM_META_GRAPH_VERSION`, `CRM_REMINDER_TEMPLATE`, `CRM_REMINDER_TEMPLATE_LANGUAGE`; `CRM_REMINDER_WHATSAPP_NUMBERS` as a JSON map of staff/admin email addresses to international +country-code numbers. Missing channels/numbers are skipped, not treated as delivered. The five supplied recipient numbers are configured server-side in `netlify/functions/_shared/crm-reminder-contacts.ts`. The JSON environment map overrides individual entries or adds numbers for new staff. Provider connections are still required. Resend is the prepared email adapter; another provider needs an adapter change.

WhatsApp template body requires four positional text parameters: reminder label (Tomorrow/Today), lead name, salesperson name, formatted follow-up date/time. Suggested template: “ETI follow-up reminder: {{1}}. Lead: {{2}}. Assigned salesperson: {{3}}. Follow-up: {{4}}. Open the CRM for details.” Configure and approve it in the WhatsApp account before activation. No secrets should be pasted into chat.

The durable delivery ledger prevents overlapping runs from sending the same job twice and rechecks ownership/schedule before sending. `accepted` means provider acceptance, not confirmed delivery. Failed, unknown and abandoned sending entries require operator review; uncertain sends are not automatically retried because WhatsApp lacks the email adapter’s idempotency key. Inspect `workspace.deliveries` and reconcile provider logs before resetting an entry. Four sends per run suits small teams; larger queues need a dedicated queue. There is no historical backfill for missed calendar days. Live sending is untested and disabled by default.

Selected WhatsApp sender: Sajeev’s **+971 544177480** (user confirmed). Meta connection is pending sign-in; do not treat this phone number as the Cloud API phone-number ID. Before enabling delivery, verify the account's displayed sending number and its API registration. Sajeev is also a requested recipient: verify Meta's same-number sender/recipient behavior and arrange another recipient number for his WhatsApp copy if required; his email copy remains independently configured.

## Detailed reporting

Reports provides Salespeople, Sources, Programmes, Pipeline, Monthly trend, Lead ageing, Follow-ups, Activities and Quotations views. Filters combine inclusive local lead creation dates, owner, source, programme and temperature. KPIs include pipeline value, enrolled value, conversion, closed-deal win rate, overdue/missing follow-ups, unassigned open leads and linked activity completion. Sort columns, export the selected report or detailed lead CSV, and open underlying leads. CSV includes filter and timezone context and spreadsheet formula escaping. Reports only receive the signed-in account's server-scoped records.

These are current-state reports for selected creation cohorts: monthly rows group by lead creation month, not enrolment transaction month. Pipeline is a current stage distribution, not a historical funnel; ageing is time since creation, not time in stage. Activities are limited to those linked to selected leads, excluding general activities. Enrolled deal value is not collected payment. Historical snapshots, attribution costs/ROI and payment accounting are not available from the current model.

## Live account setup progress

The existing etiworld.ae Netlify project is `entrepotgithub` (site ID `c3a89b0a-98a7-4e30-abc7-82b3a2127d38`). Identity is enabled; registration is Invite only with email confirmation required. The Netlify dashboard now lists all five requested accounts (verified by reading the dashboard). Do not create duplicate invitations. User confirmed all five accounts and invitation emails. No successful password login or CRM deployment has yet been verified. CLI publishing authorization is pending.

The CRM accepts verified invited Ali/cnair identities on their first login and creates the corresponding sales team record bound to the Identity ID. This path never reactivates disabled staff or rebinds an existing email to a different ID. Invitation and recovery links landing on the website root redirect to `/crm` to finish password setup. Super admins remain controlled by the configured verified-email allowlist.

## Standalone live verification

Published standalone deploy `6abd6fc9abc23fee5952074c` is live at https://crm.etiworld.ae. HTTPS and the page return 200; Identity settings return `disable_signup: true`, `autoconfirm: false`; unauthenticated CRM and team API requests return 401. All 25 unit tests, typecheck and standalone build passed. Netlify Identity audit log confirms all five requested addresses were invited on the new project. Users must accept these new invitations and set passwords themselves. Successful authenticated login and live role checks still need user completion; passwords were not entered or collected by the assistant. External message sending remains disabled.

## Workflow verification — 1 October 2026

Published to the independent CRM project: `6abd7c323543212974a037b6` at https://crm.etiworld.ae. The marketing website files and deployment were not modified.

Changes:
- Sign-in is the default entry point; sample data requires an explicit choice. Sign-out clears the live workspace.
- CSV owner names/emails map to staff IDs for admins; salesperson imports remain unassigned. Follow-up, priority and close-date columns are retained.
- Activities follow their related lead owner; assignment updates associated activities.
- Shared enrolment target is saved server-side and is editable only by super admins.
- Existing invited accounts are reconciled from Identity for the team directory; duplicate invitee account-creation buttons were removed.
- Saves reject concurrent/stale updates; original notes, authors and captured form submissions cannot be rewritten through record edits.
- Added refresh control, disabled repeated saves, and improved import errors and empty states.

Validation:
- Typecheck, production build and 30 regression tests passed.
- Browser checks in the local sample workspace: create and reopen lead after reload; owner selection; note and follow-up saving; notification badge; activity creation/completion; quotation creation; nine report tabs; salesperson filtering; export action; settings save; sample staff create/disable/restore; CSV import/export.
- Production sign-in screen rendered. Identity settings returned 200. Anonymous GET/PUT/PATCH CRM and GET/POST team requests returned 401.
- Authenticated production create/save/reload, Identity staff creation and recovery-email delivery are NOT yet verified: an interactive super-admin session is required. No real staff credentials were changed and no real lead was created during these checks.
- Meta/WhatsApp/website lead ingestion and outbound email/WhatsApp reminders still require provider setup and actual delivery tests. The user previously postponed WhatsApp connection.

## Login repair — 2 October 2026

Identity audit confirmed Sajeev's successful sign-ins, while the CRM rejected the subsequent request. The SDK's ambient server context did not supply the browser user session correctly. The API now reads the request's `nf_jwt` cookie and validates it against the project's Identity `/user` endpoint; it never authorizes by decoding unverified claims. Passwords and session values are not logged.

Published deploy `6abeb7c8217008211a6c0371`. Typecheck, build and 32 tests passed. Reloading the production browser with Sajeev's existing session successfully opened the live dashboard as super admin; Team showed all three admins and both salespeople. No password reset or credential change was needed.

## Backend expansion — 2 October 2026

Published deploy `6abeca41d018117d9ed9ddb5` to the standalone CRM. Added transactional command API (imports, bulk assignment, notes, follow-up, quotations, archive/restore and notification acknowledgement), paginated queries, server reports/exports, versioned backup downloads, admin audit history, integration health and storage diagnostics. UI now uses transactional imports, bulk assignment, server backups, per-account notification read state, and archive/restore management under Settings. Staff changes and inbound integration events are audited.

Typecheck, production build and all 41 tests passed. Authenticated production verification succeeded for CSV import, note save with verified author, activity creation, reload persistence, bulk assignment, archive, restore and audit history. The clearly labelled `Backend verification - test only` lead (example.com contact, zero value, no real messages) and its activity are archived after testing. Live System status shows all provider connections require setup and reminder delivery is disabled. No real account credentials or marketing website files were changed.

See BACKEND_API.md for endpoint contracts, access rules, operational limits and remaining provider configuration requirements.

## Lead assignment workflow — 2026-10-02
Deployed to standalone CRM (deploy 6abeced5ea8fbd6731372143). Super admins have a dedicated Lead assignment page with Unassigned/Assigned/All queues, search, bulk selection, individual assignment, recipient groups and salesperson workload. Lead details also expose Assign/Reassign. Existing server authorization rejects sales assignment through both command and record-edit routes. Ownership changes write an explicit lead.assigned audit entry and transfer related activities.
Validation: typecheck, build and all 42 tests pass. Live Sajeev session verified the queue, recipient choices (Ali/cnair and three admins), and confirmation control. Existing live lead ownership was not changed during this UI check. Marketing site unchanged.

## Corporate leads — 2026-10-02
Corporate leads has its own navigation section, preselected corporate creation, required company, designation, industry, participants, delivery mode and requirements. Shared lead workflows provide assignment, notes, follow-ups, activities, quotations, stages and recoverable deletion with existing server role checks. Corporate reports scope all report categories and related activities to corporate leads. CSV import/export carries corporate fields; backend lead/report/export queries support leadType=corporate. Existing leads can be classified through Edit lead. All-leads views continue to include both types; no existing company contacts are automatically reclassified.
Validation: typecheck/build and 45 tests passed. Live corporate test record saved and persisted across reload, then moved to Deleted leads. Existing external notification/provider setup remains unchanged.

## Website catalogue — 2026-10-02
CRM programme options now contain all 56 course-card titles from the live https://etiworld.ae/programs page. Corporate category dropdown contains the 11 category headings from https://etiworld.ae/corporate-training. Snapshot is app/crm/catalogue.ts; existing saved programme names remain visible when editing old leads. Corporate category is stored, validated against the catalogue, shown in lead details, supported in CSV import/export and backend filtering. No website edits. Typecheck, build and all 45 tests passed including corporate category persistence and rejection of invalid categories.

## Website email-preserving integration — 2026-10-02
Live website source uses FormSubmit AJAX to courses@entrepot.ae, not Netlify Forms submission handling. The website and email submission code are unchanged. crm-website-sync runs every five minutes and reads FormSubmit's official get-submissions API with CRM_FORMSUBMIT_API_KEY (Functions scope, standalone CRM site only). Request the key through https://formsubmit.co/api/get-apikey/courses@entrepot.ae and save the emailed credential in Netlify; redeploy after setting it. Do not put the key in browser code, source control or chat.

Import starts at the first configured scheduled run. Only HTTPS etiworld.ae/www.etiworld.ae submissions are eligible. Feedback/careers and honeypot entries are skipped. Stable submission hashes prevent replay; all user fields are retained and corporate enquiries are classified by page/source/category. Existing sales ownership/stages are retained. Settings → System status shows attempts/success/failure and imported count. Provider history availability is outside CRM control; this is five-minute polling, not an instant webhook. The provider's actual form_url and timestamp format, email receipt and live CRM delivery must be verified with a new enquiry after activation. No live sync has been verified without the API key.

Validation: 48 tests, typecheck and production build pass. Tests cover provider mapping, duplicate delivery, corporate categorisation, arbitrary form-field preservation, domain/date/spam exclusions and ownership preservation. Original Netlify Forms authenticated webhook remains for any future real Netlify Forms source.

## Provider activation verification — 2026-10-02
User-supplied FormSubmit key stored as a secret, production context, Functions scope on the standalone CRM. Direct official API request accepted the key and returned 15 submission records with etiworld.ae host and documented UTC timestamp structure. Production deployment 6abee1b333a8aa009034837a installed safe HTTP status diagnostics. Netlify Run now invocation reached the provider but received HTTP 403; CRM Settings → System status confirmed this result. Live sync is NOT verified/operational. No historical submissions imported and no marketing website/email submission changes made. Provider-side access from the Netlify runtime must be resolved or an officially supported alternative integration adopted. Credential is not stored in source files.

## Resolved website integration — 2026-10-02 (supersedes polling status above)

Website enquiries now submit to the existing FormSubmit AJAX endpoint and courses@entrepot.ae first. After email acceptance, the browser sends a separate CRM copy to `/.netlify/functions/crm-formsubmit`. Main website change is limited to app/lib/submitLead.ts. This is an independent browser delivery, not a provider webhook. CRM_WEBSITE_MODE=direct disables the unsuccessful provider API polling. No API credential is exposed to the browser.

The CRM endpoint permits the two official website origins, rate-limits intake, validates the website URL and submission ID, captures submitted fields, classifies corporate enquiries and deduplicates repeated delivery. Public submissions cannot assign ownership or change sales stages. Feedback and careers forms are excluded. The website retries the CRM request twice with the same submission ID; if both attempts fail, the accepted email is preserved as the fallback. This does not provide a durable retry queue during prolonged CRM outages.

Production website deploy: 6abee5fa2b79d91708e9db52. Production CRM deploy: 6abee7402d12451969c57abc. Typecheck and all 50 tests passed. A live contact-form enquiry named “ETI CRM connection check — test only” reached the thank-you page and appeared in CRM as an unassigned Website lead with captured fields, note and follow-up activity. The user explicitly confirmed receipt at courses@entrepot.ae. Both email and CRM delivery are verified. The clearly labelled test record is retained for inspection.

## All-form enquiry visibility repair — 2026-10-02

Production audit found three submissions (contact plus two corporate enquiries) under the same individual lead: contact matching merged distinct enquiries and retained the first lead type and programme. It was a CRM record-matching issue, not a missing email or form-specific connection.

Deploy 6abee9ef59f2ca1cbcf60624 creates one new lead per accepted website submission ID. A transport retry with the same ID remains idempotent. Repeated contacts can have separate enquiries, including individual and corporate opportunities. Existing records with unchanged contact details remain editable/assignable, and website enquiries can be restored even when another enquiry shares the contact. Manual creation/import duplicate guards remain.

Super-admin-only `website.recover` command (Settings → System status → Recover merged website enquiries) creates independent records from additional historical website submissions on active merged leads. It is repeatable using stable recovery event IDs, retains original histories/assignments, and preserves submission dates. Executed in production: recovered two corporate enquiries (test / eti and gulati / sky). No existing leads, notes or assignments were deleted.

All ten sales form variants were submitted through the live browser with the SAME synthetic contact to reproduce the former issue: homepage, contact, student registration, programme enquiry modal, brochure download modal, corporate-training, customised-corporate-training compact/full and customised-corporate-trainings-programmes compact/full. All ten reached the thank-you page and appeared as ten separate Website leads. Test names begin “ETI form audit —” and end “— test only”, email eti-form-audit@example.com, phone 0000000099. They remain labelled in the CRM for inspection; no sales action is intended. Corporate cases appeared in Corporate leads. The main corporate test deliberately omitted the optional programme and correctly stores “Programme to be confirmed”.

The feedback form has no email/phone fields and remains email-only feedback, not a sales lead. Careers uses email links rather than a sales enquiry form. Shared programme/brochure components cover programme pages; the representative live modal test used the CMA page. Source inventory confirms all sales forms use submitLead. No website code or email destination was changed during this repair; main website deploy remains 6abee5fa2b79d91708e9db52. FormSubmit accepted all ten tests; mailbox receipt for this new batch has not been independently verified. Typecheck/build and 52 regression tests passed.

## Exclusive lead sections — 2026-10-02

Leads now lists only individual enquiries (including legacy records without an explicit type); Corporate leads lists only corporate enquiries. Section counts, filters, select-all and CSV exports use the same scoped collection. Sidebar counts show each section separately. Contacts remains the combined contact directory; account/programme drilldowns use Contacts to preserve access to both opportunity types. No data records or email/integration processes changed. Typecheck and production build passed.

## Automatic refresh visibility — 2026-10-02

The live workspace refreshes every 60 seconds. Lead-list footers now display the last successful refresh time. Returning to a visible CRM tab or regaining connectivity also refreshes immediately; background-refresh overlap is prevented. The refresh updates shared data without resetting open editor drafts during an active session. Typecheck and production build passed.

## Inline lead temperature — 2026-10-02

Deploy 6abeeff1e95817259a834df1 adds coloured Hot/Warm/Cold selects to lead table rows and lead details, including corporate leads. Changes save immediately through the existing versioned, authorized record endpoint. Super admins can update any record; active salespeople can update only assigned records. Failed saves retain the previous displayed selection and show the error. Typecheck/build and 53 tests passed, including assigned-sales/admin temperature saves and denial for another salesperson's or unassigned leads. Live test: the labelled contact-form audit lead was changed to Hot and remained Hot after reloading, with the same selection in lead details.

## Temperature colour correction — 2026-10-02

Deploy 6abef0a3f357404eb1eaf9c0 fixes the general select CSS overriding temperature colours. Hot is red, Warm amber and Cold blue; each lead row also has a matching left edge marker. Both derive from saved temperature, so they change together on successful save. Typecheck/build passed.

## Super-admin bulk lead controls — 2026-10-02

Deploy 6abef1974c7a1f1f7b87371e adds Select all, Clear selection, Delete selected and Delete all to lead lists for super admins. Salespeople no longer see selection checkboxes. Delete all scopes to the current section and filters, freezes IDs/versions at confirmation, and moves records into Deleted leads through the admin-only atomic delete.bulk command. New arrivals are not included. Typecheck/build and 54 tests passed. Live admin UI verified Select all checks all eight individual rows, confirmation identifies the exact eight records, Cancel leaves records intact, and Corporate leads exposes its separate controls. No live records were deleted during UI verification.

## Reena super-admin email replacement — 2026-10-02

Configured full super-admin access and the existing Reena WhatsApp recipient mapping for rdsouza@entrepot.ae, replacing reena@entrepot.ae. Production Functions environment has no CRM_SUPER_ADMIN_EMAILS override. Directory reconciliation accepts the explicitly approved old-to-new email change on the SAME Identity ID, retaining record ownership/history. All 55 tests pass, including new-address authorization and old-address denial.

Identity user 3be1ebc7-3631-432b-8501-a05072ee830f still has the old login email at preparation time. Its Edit settings panel is open for the user to change Email and save; browser security policy requires user handoff for login-credential changes. Do not claim Identity email change or verification completed until checked after handoff. No password or Identity credential was changed by the agent.

Reena email change verified after user handoff: Netlify Identity user 3be1ebc7-3631-432b-8501-a05072ee830f displays rdsouza@entrepot.ae, and the live CRM Team page displays Reena / rdsouza@entrepot.ae / Full access. The same Identity ID was preserved and the directory reconciled successfully. No password was changed by the agent.

## Mobile CRM layout — 2026-10-02

Responsive lead cards replace wide lead tables below 800px, retaining selection, programme, source, stage, temperature, owner, value and actions. Mobile navigation has a backdrop, close control, expanded-state semantics and hidden off-canvas controls. Forms use one column and 16px inputs; buttons are at least 44px tall. Drawers/dialogs fit dynamic viewport height, table/report/pipeline scrolling stays contained, and safe-area spacing supports phone screens. Desktop lead tables are unchanged.

Validation: typecheck/build passed. Live checks at 390×844 and 320×740 verified lead cards, main/corporate section navigation and new-lead form. Document scrollWidth equals viewport width for individual leads, corporate leads and reports at 320px; reports also fit 768px tablet width. Resetting viewport restored desktop table/table-header-group display. No records created/deleted in mobile testing and no website or email integration changes.

## Additional super admin — 3 October 2026

Added sales@entrepot.ae (Sales Admin) to the configured super-admin identities. A confirmed Identity login receives the same full CRM permissions as the existing administrators. Reminder email copies include this address; WhatsApp requires a separately supplied number. Identity invitation/acceptance is required before first login.

## Fifth super admin — 3 October 2026

Added fly@entrepot.ae (Fly Admin) to the configured super-admin identities with the same full CRM access as existing administrators after Identity verification. Email reminder copies include this address. Invitation acceptance and password setup are required for the new login.

## Meta Lead Ads activated — 3 October 2026

Meta app ETI CRM (934869105971932), business ETI World (461832413110477), Page Entrepot Training Institute (265074903355968). App published. Page webhook verified at https://crm.etiworld.ae/.netlify/functions/crm-meta; leadgen subscribed on v26.0. Page subscribed_apps registration returned success.

Production Functions variables configured: CRM_META_APP_SECRET, CRM_META_VERIFY_TOKEN, CRM_META_PAGE_ID, CRM_META_GRAPH_VERSION, CRM_META_PAGE_TOKEN. Secret values are stored only in Netlify; do not add them to source. Latest credential deploy: 6ac0b9c058aa223ea8cc83b0.

End-to-end test: Communication Form 715755664889907, Meta lead 3629333750561500; Meta tracking shows Success for ETI CRM. CRM storage confirmed lead 31419a8b-f295-45dc-9856-e0f0a04d43d3, source Meta Ads, owner Unassigned, one submission and one related task; deduplication event persisted. Synthetic test remains for review. Other pre-existing Pabbly Connect subscription was left untouched.

Token debugger: Page token valid, token expiry Never, data access expires 2027-01-01T08:12:53+00:00; renew authorization before this date. Scopes pages_show_list, leads_retrieval, pages_read_engagement, pages_manage_metadata, public_profile. No WhatsApp connection or historical lead backfill was performed.
