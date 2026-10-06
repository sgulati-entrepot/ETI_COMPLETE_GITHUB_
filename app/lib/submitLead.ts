export type LeadDestination = "courses" | "programs";

const FORM_ENDPOINTS: Record<LeadDestination, string> = {
  courses: "https://formsubmit.co/ajax/courses@entrepot.ae",
  programs: "https://formsubmit.co/ajax/programs@entrepot.ae",
};

const FIELD_ALIASES: Record<string, string[]> = {
  Name: ["Name", "Full name", "name"],
  Email: ["Email", "email"],
  Phone: ["Phone", "Mobile / WhatsApp"],
  Organisation: ["Organisation", "organisation", "Company"],
  Programme: ["Programme interest", "Course or capability", "Course", "interest", "Programme"],
  Message: ["Message", "message"],
  Consent: ["Consent", "Declaration"],
};

function firstNonEmptyValue(data: FormData, names: string[]) {
  for (const name of names) {
    const value = data.get(name);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function buildLeadPayload(data: FormData) {
  const payload = new URLSearchParams();

  for (const [key, value] of data.entries()) {
    if (typeof value === "string") payload.append(key, value);
  }

  for (const [canonicalName, aliases] of Object.entries(FIELD_ALIASES)) {
    const value = firstNonEmptyValue(data, aliases);
    for (const alias of aliases) payload.delete(alias);
    if (value) payload.set(canonicalName, value);
  }

  const subject = firstNonEmptyValue(data, ["_subject", "subject"]) || "New ETI website lead";
  payload.delete("form-name");
  payload.delete("subject");
  payload.set("_subject", subject);
  if (!payload.get("Lead source")) payload.set("Lead source", String(data.get("Form") || "ETI website"));
  payload.set("_template", "table");
  payload.set("_captcha", "false");
  if (payload.get("Email")) payload.set("_replyto", payload.get("Email")!);
  const honeypot = payload.get("bot-field");
  payload.delete("bot-field");
  if (honeypot) payload.set("_honey", honeypot);
  for (const [key, value] of Array.from(payload.entries())) {
    if (!value.trim()) payload.delete(key);
  }

  return payload;
}

export async function submitLead(data: FormData, destination: LeadDestination = "courses") {
  const payload = buildLeadPayload(data);
  // Keep email acceptance independent from the CRM copy.
  if (typeof window !== "undefined" && ["etiworld.ae", "www.etiworld.ae", "etiworld.in", "www.etiworld.in"].includes(window.location.hostname) && !/^\/(feedback|careers)(\/|$)/.test(window.location.pathname)) {
    payload.set("CRM Submission ID", crypto.randomUUID());
    payload.set("CRM Page URL", window.location.origin + window.location.pathname);
    payload.set("_url", window.location.origin + window.location.pathname);
  }

  const response = await fetch(FORM_ENDPOINTS[destination], {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(Object.fromEntries(payload)),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed (${response.status})`);
  }
  const result = await response.json();
  if (result.success !== true && result.success !== "true") {
    throw new Error("FormSubmit did not accept the submission");
  }
  if (payload.has("CRM Submission ID")) {
    // Only copy an accepted enquiry. A failed CRM copy must never report the email as failed.
    const body = JSON.stringify({form_data: Object.fromEntries(payload)});
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const copy = await fetch("https://crm.etiworld.ae/.netlify/functions/crm-formsubmit", {
          method: "POST", headers: {"Content-Type":"application/json"}, body,
          signal: AbortSignal.timeout(4000), keepalive: true,
        });
        if (copy.ok) break;
        if (copy.status >= 400 && copy.status < 500 && copy.status !== 429) break;
      } catch { /* Email already accepted; retry the same ID safely. */ }
    }
  }
}
