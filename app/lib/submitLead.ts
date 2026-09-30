export type LeadDestination = "courses" | "programs";

const FORM_NAMES: Record<LeadDestination, string> = {
  courses: "eti-leads-courses",
  programs: "eti-leads-programs",
};

export async function submitLead(data: FormData, destination: LeadDestination = "courses") {
  const payload = new URLSearchParams();

  for (const [key, value] of data.entries()) {
    if (typeof value === "string") payload.append(key, value);
  }

  const formName = FORM_NAMES[destination];
  payload.set("form-name", formName);
  payload.set("subject", String(data.get("_subject") || "New ETI website lead"));
  payload.delete("_template");
  payload.delete("_captcha");

  const response = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!response.ok) {
    throw new Error(`Lead submission failed (${response.status})`);
  }
}
