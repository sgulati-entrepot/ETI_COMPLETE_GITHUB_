export type LeadDestination = "courses" | "programs";

const FORM_NAMES: Record<LeadDestination, string> = {
  courses: "eti-leads-courses",
  programs: "eti-leads-programs",
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

export function buildLeadPayload(data: FormData, destination: LeadDestination = "courses") {
  const payload = new URLSearchParams();

  for (const [key, value] of data.entries()) {
    if (typeof value === "string") payload.append(key, value);
  }

  for (const [canonicalName, aliases] of Object.entries(FIELD_ALIASES)) {
    const value = firstNonEmptyValue(data, aliases);
    for (const alias of aliases) payload.delete(alias);
    if (value) payload.set(canonicalName, value);
  }

  const formName = FORM_NAMES[destination];
  const subject = firstNonEmptyValue(data, ["_subject", "subject"]) || "New ETI website lead";
  payload.set("form-name", formName);
  payload.set("subject", subject);
  if (!payload.get("Lead source")) payload.set("Lead source", String(data.get("Form") || "ETI website"));
  payload.delete("_subject");
  payload.delete("_template");
  payload.delete("_captcha");

  return payload;
}

export async function submitLead(data: FormData, destination: LeadDestination = "courses") {
  const payload = buildLeadPayload(data, destination);

  const response = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed (${response.status})`);
  }
}
