"use strict";
/* Brandroom · CreativHeads — the Knowledgebase screens. Data comes from /api/br/* (the existing ck_* tables). */

/* ================= icons (lucide) ================= */
const ICONS = {"trash":"<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/><path d=\"M10 11v6\"/><path d=\"M14 11v6\"/>","archive":"<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\"/><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\"/><path d=\"M10 12h4\"/>","book-open":"<path d=\"M12 5v16\"/><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"/>","braces":"<path d=\"M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1\"/><path d=\"M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1\"/>","check-check":"<path d=\"M18 6 7 17l-5-5\"/><path d=\"m22 10-7.5 7.5L13 16\"/>","check":"<path d=\"M20 6 9 17l-5-5\"/>","chevron-down":"<path d=\"m6 9 6 6 6-6\"/>","chevron-left":"<path d=\"m15 18-6-6 6-6\"/>","chevron-right":"<path d=\"m9 18 6-6-6-6\"/>","chevron-up":"<path d=\"m18 15-6-6-6 6\"/>","chevrons-up-down":"<path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/>","circle-alert":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/>","clock-3":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6h4\"/>","copy":"<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>","file-text":"<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"/><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>","image":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>","info":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>","layers":"<path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\"/><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\"/><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\"/>","layout-grid":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>","list":"<path d=\"M3 5h.01\"/><path d=\"M3 12h.01\"/><path d=\"M3 19h.01\"/><path d=\"M8 5h13\"/><path d=\"M8 12h13\"/><path d=\"M8 19h13\"/>","loader-circle":"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/>","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","message-square":"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/>","panel-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M9 3v18\"/>","plug":"<path d=\"M12 22v-5\"/><path d=\"M15 8V2\"/><path d=\"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z\"/><path d=\"M9 8V2\"/>","plus":"<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>","refresh-cw":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>","scissors":"<circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M8.12 8.12 12 12\"/><path d=\"M20 4 8.12 15.88\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M14.8 14.8 20 20\"/>","search":"<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>","settings-2":"<path d=\"M14 17H5\"/><path d=\"M19 7h-9\"/><circle cx=\"17\" cy=\"17\" r=\"3\"/><circle cx=\"7\" cy=\"7\" r=\"3\"/>","shield-check":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>","sparkles":"<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>","star":"<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>","tag":"<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>","upload":"<path d=\"M12 3v12\"/><path d=\"m17 8-5-5-5 5\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>","video":"<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"/><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/>","x":"<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>","zap":"<path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\"/>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/>",
  "log-out": "<path d=\"m16 17 5-5-5-5\"/><path d=\"M21 12H9\"/><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/>",
  "external-link": "<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>"};
const ic = (name, { size = 24, cls = "", fill = "none" } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}${cls ? " " + cls : ""}" aria-hidden="true">${ICONS[name] || ""}</svg>`;

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dm = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" });
const hm = (t) => new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
const initials = (s) => String(s || "").split(/[ &]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
const pad2 = (n) => String(n).padStart(2, "0");
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + Math.random().toString(16).slice(2));
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "YouTube", "WhatsApp", "Website"];
const LANGUAGES = ["English", "Malayalam", "Manglish"];

async function api(path, body) {
  const r = await fetch("/api" + path, body === undefined ? { cache: "no-store", headers: { "x-section": "kb" } } : { method: "POST", headers: { "content-type": "application/json", "x-requested-with": "app", "x-section": "kb" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { st.me = null; st.ws = null; renderLogin(); throw Object.assign(new Error(d.error || "Please sign in."), { status: 401 }); }
  if (!r.ok) throw Object.assign(new Error(d.error || "Please try again."), { status: r.status });
  return d;
}
async function apiDelete(path) {
  const r = await fetch("/api" + path, { method: "DELETE", headers: { "x-requested-with": "app", "x-section": "kb" } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Please try again."), { status: r.status });
  return d;
}
const act = (b) => api("/br/workspace", b);
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast.success("Copied to clipboard"); } catch { toast.error("Clipboard is unavailable. Select the text to copy it."); } }

/* ================= ui primitives (shadcn class strings) ================= */
const BTN = "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const VAR = { default: "bg-primary text-primary-foreground hover:bg-primary/90", outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50", ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50" };
const SIZE = { default: "h-9 px-4 py-2 has-[>svg]:px-3", sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5", lg: "h-10 rounded-md px-6 has-[>svg]:px-4", icon: "size-9", "icon-sm": "size-8", "icon-7": "size-7" };
function btn(inner, { variant = "default", size = "default", cls = "", a = "", type = "button", disabled = false, attrs = "" } = {}) {
  const base = size === "sm" ? BTN.replace(" gap-2 ", " ") : BTN;
  return `<button data-slot="button" data-variant="${variant}" data-size="${size}" type="${type}" class="${base} ${VAR[variant]} ${SIZE[size]}${cls ? " " + cls : ""}"${a ? ` data-a="${a}"` : ""}${disabled ? " disabled" : ""}${attrs ? " " + attrs : ""}>${inner}</button>`;
}
const INPUT = "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";
const TEXTAREA = "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40";
const input = ({ id = "", value = "", placeholder = "", type = "text", inp = "", attrs = "" } = {}) => `<input data-slot="input" class="${INPUT}" type="${type}"${id ? ` id="${id}"` : ""} value="${esc(value)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${inp ? ` data-in="${inp}"` : ""} ${attrs}>`;
const textarea = ({ id = "", value = "", placeholder = "", rows = 4, inp = "", attrs = "" } = {}) => `<textarea data-slot="textarea" class="${TEXTAREA}"${id ? ` id="${id}"` : ""} rows="${rows}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${inp ? ` data-in="${inp}"` : ""} ${attrs}>${esc(value)}</textarea>`;
const progress = (v, { cls = "", label = "" } = {}) => `<div aria-valuemax="100" aria-valuemin="0" aria-valuenow="${v}" role="progressbar" data-state="${v >= 100 ? "complete" : "loading"}" data-value="${v}" data-max="100" data-slot="progress" class="relative h-2 w-full overflow-hidden rounded-full bg-primary/20${cls ? " " + cls : ""}"${label ? ` aria-label="${esc(label)}"` : ""}><div data-state="${v >= 100 ? "complete" : "loading"}" data-value="${v}" data-max="100" data-slot="progress-indicator" class="h-full w-full flex-1 bg-primary transition-all" style="transform: translateX(-${100 - (v || 0)}%);"></div></div>`;
const pill = (inner, kind = "") => `<span class="pill ${kind}">${inner}</span>`;
const SW = "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80";
const SWT = "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground";
const toggle = (on, a, { size = "default", label = "" } = {}) => { const s = on ? "checked" : "unchecked"; return `<button type="button" role="switch" aria-checked="${on}" data-state="${s}" value="on" data-slot="switch" data-size="${size}" class="${SW}" aria-label="${esc(label)}" data-a="${a}"><span data-state="${s}" data-slot="switch-thumb" class="${SWT}"></span></button>`; };
const TABS = "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col";
const TLIST = "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none gap-1 bg-transparent";
const TTRIG = "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100";
function tabs(value, items, onPick, { cls = "", content = "" } = {}) {
  return `<div dir="ltr" data-orientation="horizontal" data-slot="tabs" class="${TABS}${cls ? " " + cls : ""}"><div role="tablist" aria-orientation="horizontal" data-slot="tabs-list" data-variant="line" class="${TLIST}" data-orientation="horizontal">${items.map(([v, label]) => `<button type="button" role="tab" aria-selected="${v === value}" data-state="${v === value ? "active" : "inactive"}" data-slot="tabs-trigger" class="${TTRIG}" data-a="${reg(() => onPick(v))}">${label}</button>`).join("")}</div>${content ? `<div data-state="active" data-orientation="horizontal" role="tabpanel" data-slot="tabs-content" class="flex-1 outline-none">${content}</div>` : ""}</div>`;
}
const SEL_TRIG = "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";
const SEL_CONTENT = "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1";
const SEL_ITEM = "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2";
function select(value, options, onChange, { label = "", cls = "" } = {}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)); const cur = opts.find((o) => o.value === value);
  const id = reg((ev, el) => openSelect(el, opts, value, onChange));
  return `<button type="button" role="combobox" aria-expanded="false" aria-autocomplete="none" dir="ltr" data-state="closed" data-slot="select-trigger" data-size="default" class="${SEL_TRIG} choice${cls ? " " + cls : ""}" aria-label="${esc(label)}" data-a="${id}"${cur ? "" : " data-placeholder=\"\""}><span data-slot="select-value" style="pointer-events: none;">${esc(cur ? cur.label : label)}</span>${ic("chevron-down", { cls: "size-4 opacity-50" })}</button>`;
}
function openSelect(trigger, opts, value, onChange) {
  closePopover(); const r = trigger.getBoundingClientRect(); trigger.setAttribute("aria-expanded", "true"); trigger.dataset.state = "open";
  const below = window.innerHeight - r.bottom > 220 || r.top < 240; const pop = document.createElement("div"); pop.className = "br-popper";
  pop.style.cssText = `position:fixed;left:${Math.min(r.left, window.innerWidth - Math.max(r.width, 128) - 8)}px;${below ? `top:${r.bottom}px` : `bottom:${window.innerHeight - r.top}px`};min-width:${r.width}px;z-index:60;--radix-select-trigger-width:${r.width}px;--radix-select-content-available-height:${below ? window.innerHeight - r.bottom - 12 : r.top - 12}px`;
  pop.innerHTML = `<div data-slot="select-content" role="listbox" data-state="open" data-side="${below ? "bottom" : "top"}" class="${SEL_CONTENT}" style="max-height:var(--radix-select-content-available-height)"><div class="p-1 w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1">${opts.map((o, i) => `<div role="option" tabindex="-1" data-i="${i}" aria-selected="${o.value === value}" data-state="${o.value === value ? "checked" : "unchecked"}" data-slot="select-item" class="${SEL_ITEM}"><span data-slot="select-item-indicator" class="absolute right-2 flex size-3.5 items-center justify-center">${o.value === value ? ic("check", { cls: "size-4" }) : ""}</span><span>${esc(o.label)}</span></div>`).join("")}</div></div>`;
  document.body.appendChild(pop); popover = { el: pop, trigger };
  const items = [...pop.querySelectorAll("[data-i]")]; const focusAt = (i) => { const el = items[Math.max(0, Math.min(items.length - 1, i))]; el?.focus(); };
  focusAt(Math.max(0, opts.findIndex((o) => o.value === value)));
  items.forEach((el) => { el.addEventListener("mouseenter", () => el.focus()); el.addEventListener("click", () => { const o = opts[+el.dataset.i]; closePopover(); trigger.focus(); if (o.value !== value) onChange(o.value); }); });
  pop.addEventListener("keydown", (e) => { const i = items.indexOf(document.activeElement); if (e.key === "ArrowDown") { e.preventDefault(); focusAt(i + 1); } else if (e.key === "ArrowUp") { e.preventDefault(); focusAt(i - 1); } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.activeElement?.click(); } else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); closePopover(); trigger.focus(); } });
}
let popover = null;
function closePopover() { if (!popover) return; popover.el.remove(); popover.trigger.setAttribute("aria-expanded", "false"); popover.trigger.dataset.state = "closed"; popover = null; }
document.addEventListener("mousedown", (e) => { if (popover && !popover.el.contains(e.target) && !popover.trigger.contains(e.target)) closePopover(); });
window.addEventListener("resize", closePopover); window.addEventListener("scroll", (e) => { if (popover && !popover.el.contains(e.target)) closePopover(); }, true);

/* action registry: data-a="id" (click), data-in="id" (input), data-sub="id" (submit) */
let REG = new Map(), regN = 0;
const reg = (fn) => { const id = "a" + ++regN; REG.set(id, fn); return id; };
document.addEventListener("click", (e) => { const el = e.target.closest("[data-a]"); if (!el || el.disabled) return; const fn = REG.get(el.dataset.a); if (fn) { if (el.tagName === "A" && !el.dataset.keep) e.preventDefault(); fn(e, el); } });
document.addEventListener("input", (e) => { const el = e.target.closest("[data-in]"); if (!el) return; const fn = REG.get(el.dataset.in); if (fn) fn(el.value, el, e); });
document.addEventListener("submit", (e) => { const el = e.target.closest("[data-sub]"); if (!el) return; e.preventDefault(); const fn = REG.get(el.dataset.sub); if (fn) fn(e, el); });
document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (popover) return closePopover(); if (st.dialog && !st.dialog.locked) return closeDialog(); if (st.mobileOpen) { st.mobileOpen = false; renderShell(); } if (menuEl) closeMenu(); });

/* toasts (sonner look) */
const toast = { show(type, msg) { const t = $("#toaster"); const el = document.createElement("div"); el.className = `br-toast ${type}`; el.setAttribute("role", "status"); el.innerHTML = `${ic(type === "success" ? "circle-check" : "circle-alert", { size: 18 })}<span>${esc(msg)}</span>`; t.appendChild(el); requestAnimationFrame(() => el.classList.add("in")); setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 300); }, 4000); }, success(m) { toast.show("success", m); }, error(m) { toast.show("error", m); } };

/* dialogs (radix look) */
const DLG_OVERLAY = "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";
const DLG = "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg";
const ALERT = "group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg";
const DLG_CLOSE = "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const dlgHeader = (t, d, extra = "") => `<div data-slot="dialog-header" class="flex flex-col gap-2 text-center sm:text-left">${extra}<h2 data-slot="dialog-title" class="text-lg leading-none font-semibold">${t}</h2>${d ? `<p data-slot="dialog-description" class="text-sm text-muted-foreground">${d}</p>` : ""}</div>`;
const dlgFooter = (inner) => `<div data-slot="dialog-footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">${inner}</div>`;
const alertHeader = (t, d) => `<div data-slot="alert-dialog-header" class="grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]"><h2 data-slot="alert-dialog-title" class="text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2">${t}</h2><p data-slot="alert-dialog-description" class="text-sm text-muted-foreground">${d}</p></div>`;
const alertFooter = (inner) => `<div data-slot="alert-dialog-footer" class="flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end">${inner}</div>`;
function openDialog(render, { alert = false, cls = "", onClose = null } = {}) { st.dialog = { render, alert, cls, onClose, locked: false }; renderDialog(true); }
function renderDialog(first = false) {
  const d = st.dialog; const p = $("#portal"); if (!d) { p.innerHTML = ""; return; }
  const focused = document.activeElement && p.contains(document.activeElement) ? document.activeElement.id : null;
  const close = reg(() => { if (!st.dialog?.locked) closeDialog(); });
  p.innerHTML = `<div data-state="open" data-slot="${d.alert ? "alert-dialog-overlay" : "dialog-overlay"}" class="${DLG_OVERLAY}"${d.alert ? "" : ` data-a="${close}"`}></div><div role="${d.alert ? "alertdialog" : "dialog"}" aria-modal="true" data-state="open" data-size="default" data-slot="${d.alert ? "alert-dialog-content" : "dialog-content"}" class="${d.alert ? ALERT : DLG}${d.cls ? " " + d.cls : ""}" tabindex="-1">${d.render()}${d.alert ? "" : `<button type="button" data-slot="dialog-close" class="${DLG_CLOSE}" data-a="${close}">${ic("x")}<span class="sr-only">Close</span></button>`}</div>`;
  document.body.style.overflow = "hidden";
  if (first) setTimeout(() => (p.querySelector("input:not([type=file]),textarea,[data-autofocus]") || p.querySelector("[role=dialog],[role=alertdialog]"))?.focus(), 30);
  else if (focused) document.getElementById(focused)?.focus();
}
function closeDialog() { const d = st.dialog; st.dialog = null; closePopover(); renderDialog(); document.body.style.overflow = ""; d?.onClose?.(); }

/* ================= knowledge sections ================= */
const F = (key, label, help, example, short = false) => ({ key, label, help, example, short });
const SECTIONS = [
  { id: "basics", lib: "basics", name: "Brand basics", description: "Start with the story behind the brand.", fields: [F("about", "About the brand", "What they do, who they serve, and what sets them apart.", "A Kerala-based surface brand for thoughtful homes."), F("website", "Website", "The public website, if available.", "https://example.com", true)] },
  { id: "voice", lib: "voice", name: "Voice & tone", description: "Make every caption sound unmistakably like them.", fields: [F("tone", "Tone summary", "Describe the personality in one or two sentences.", "Warm and confident. Helpful, never pushy."), F("adjectives", "Voice adjectives", "Separate a few distinctive traits with commas.", "Considered, warm, quietly confident", true), F("soundsLike", "Sounds like", "A sentence that captures the brand.", "Beautiful surfaces. Made for real life."), F("doesNotSoundLike", "Does not sound like", "An example of what the brand would never say.", "HURRY! CRAZY DEALS!"), F("dos", "Do", "Writing habits to follow.", "Lead with an everyday benefit. Use simple words."), F("donts", "Don’t", "Writing habits to avoid.", "Avoid exaggerated claims and pressure to buy.")] },
  { id: "audience", name: "Audience", description: "Write for people, with a clear sense of their needs.", fields: [F("audience", "Audience summary", "Who is most likely to care?", "Homeowners aged 28–45 in Kerala."), F("personas", "Personas & needs", "Include motivations, locations and objections.", "First-time homeowner · Kochi · wants durability, worries about cost.")] },
  { id: "products", name: "Products & USPs", description: "Keep product facts and benefits close at hand.", fields: [F("products", "Products or services", "One offering per line, with its key benefit.", "Stone tiles — a versatile surface for indoor spaces."), F("usps", "What makes them different", "Use claims the client has verified.", "Thoughtful design and local product support.")] },
  { id: "messages", lib: "voice", name: "Key messages", description: "The ideas this brand should be remembered for.", fields: [F("tagline", "Tagline", "The approved brand line.", "Made for everyday living.", true), F("messages", "Key messages", "One message per line.", "Materials that make a space feel like home."), F("validity", "Campaign validity", "Record start and end dates for time-sensitive copy.", "No active limited-time campaign.", true)] },
  { id: "words", lib: "voice", name: "Words to use & avoid", description: "A shared vocabulary keeps the voice consistent.", fields: [F("wordsUse", "Words to use", "Separate words with commas.", "thoughtful, everyday, considered", true), F("wordsAvoid", "Words to avoid", "Separate words with commas.", "cheap, guaranteed, No.1", true), F("bannedClaims", "Banned claims", "Claims this brand must never make.", "No.1 in Kerala", true)] },
  { id: "languages", name: "Languages", description: "Match the language to the audience and the moment.", fields: [F("primaryLanguage", "Primary language", "English, Malayalam or Manglish.", "English", true), F("languageNotes", "Language guidelines", "Explain when to switch languages and which script to use.", "English for LinkedIn. Conversational Manglish for Instagram reels.")] },
  { id: "social", lib: "hashtags", name: "Hashtags & CTA", description: "Set the rules for the end of every caption.", fields: [F("hashtags", "Brand hashtags", "Separate tags with spaces.", "#Whitestone #ThoughtfulHomes", true), F("bannedHashtags", "Banned hashtags", "Leave empty when there are none.", "#CheapDeals", true), F("cta", "Preferred call to action", "Use an approved, repeatable next step.", "Explore the collection.", true), F("emoji", "Emoji rules", "Set a simple limit and preferred style.", "At most one emoji. Avoid urgency symbols.", true)] },
  { id: "platforms", name: "Platform rules", description: "Adapt the same voice to different formats.", fields: [F("platforms", "Active platforms", "Separate platform names with commas.", "Instagram, Facebook, LinkedIn", true), F("maxLength", "Maximum caption length", "A character limit for this brand.", "2200", true), F("format", "Format & media rules", "Hooks, aspect ratios, video length and hashtag counts.", "Instagram: hook first, 3 hashtags, 4:5 posts or 9:16 reels.")] },
  { id: "compliance", lib: "voice", name: "Compliance", description: "Keep the claims clear, supportable and approved.", fields: [F("compliance", "Claims & restrictions", "What needs evidence or client approval?", "No unverified superlatives or warranty promises."), F("disclaimer", "Required disclaimer", "Included verbatim in captions when present.", "Images are for illustration purposes only.")] },
  { id: "seasonal", name: "Festivals & seasons", description: "Capture the moments that matter to this brand.", fields: [F("seasonal", "Seasonal opportunities", "Include dates, lead time and local considerations.", "Onam: plan 21 days ahead. Confirm current dates with the client.")] },
  { id: "contacts", lib: "contacts", name: "Contacts & approvals", description: "Know who can give the final yes.", fields: [F("contacts", "Client contacts", "Name, role, email and phone.", "Marketing lead · marketing@example.com"), F("approvals", "Approval rules", "Who approves which work?", "Client marketing lead approves every caption before publishing."), F("approvalGroup", "Approval WhatsApp group", "The group name as it appears. Never an invite link.", "Brand X – Approvals", true), F("approvalTurnaround", "Usual turnaround", "Hours or working days.", "24 working hours", true)] },
  { id: "assets", name: "Asset links", description: "Point the team to the original files.", fields: [F("assets", "OneDrive or SharePoint links", "One labelled URL per line.", "Brand guide: https://example.com/brand-guide")] },
  { id: "recognition", lib: "basics", name: "Brand recognition", description: "Help match a creative to the right brand.", fields: [F("businessType", "Business type", "What kind of business this is.", "Tile showroom", true), F("aliases", "Names & aliases", "Short names, nicknames and common spellings.", "whitestone, white stone, wst", true), F("keywords", "Detection keywords", "Distinctive terms that appear in filenames or messages.", "stone tiles, surface collection", true), F("colours", "Brand colours", "Name and hex, separated by commas.", "Navy #0A3D62, Sand #E6D5B8", true), F("fonts", "Brand fonts", "The typefaces used on creatives.", "Heading: Fraunces. Body: Source Sans", true), F("logoRules", "Logo rules", "Placement, contrast and clear-space requirements.", "Use the primary mark with clear space on every side."), F("phones", "Public phone numbers", "As printed on posts, with the country code.", "+91 98470 00000", true), F("handles", "Social handles", "Platform and handle, one per line.", "Instagram: brandname", true), F("address", "Public address", "The address a customer would see.", "Kochi, Kerala", true), F("onedriveFolder", "OneDrive client folder", "The link to this client's folder.", "https://example.com/client-folder")] },
  { id: "offers", lib: "offers", name: "Offers and prices", description: "Prices as they may appear on a creative, with the dates they are valid.", fields: [F("offers", "Current offers", "One offer per line: text, price, valid from, valid to.", "Monsoon offer: 10% off, valid till 31/10")] },
  { id: "ads", lib: "ads", name: "Ads info", description: "Targets the client agreed. Never store an ads login, token or password.", fields: [F("adAccounts", "Ad accounts", "Platform, account name and the account id shown in the ads manager.", "Meta: Brand Leads, act_000", true), F("adBudgets", "Monthly budget", "The agreed budget, not live spend.", "As agreed with the client", true), F("adAreas", "Target areas", "Where the ads should run.", "Kochi + 20 km", true), F("adKpis", "KPIs", "The metric and the target.", "Cost per lead, as agreed", true)] },
  { id: "seo", lib: "seo", name: "SEO", description: "The client-approved starting list. SEO Studio keeps the live rankings.", fields: [F("seoKeywords", "Target keywords", "Phrase, language and the page it belongs to.", "tile adhesive kochi — /products/adhesive"), F("seoCompetitors", "SEO competitors", "Name and website. These are not the private competitor notes.", "Example Tiles — example.com"), F("sitePages", "Key site pages", "URL, page type and the main keyword.", "/products/adhesive — product — tile adhesive")] },
  { id: "competitors", name: "Competitor notes", description: "Private. Hidden from staff and from every bot.", fields: [F("competitors", "Competitor notes", "Relationship notes about competitors. Kept inside the team.", "Do not mention competitor names in captions.")] },
  { id: "internal", name: "Internal notes", description: "For the team only. Never included in the bot’s writing context.", fields: [F("internalNotes", "Private team notes", "Keep relationship and account notes here.", "Demo account. Confirm all brand details before use.")] },
];
const filled = (c, k) => !!String(c.fields[k] || "").trim();
const score = (c) => { const s = SECTIONS.filter((x) => x.id !== "internal" && x.id !== "competitors"); return Math.round((s.filter((x) => x.fields.some((f) => filled(c, f.key))).length / s.length) * 100); };
const missing = (c) => SECTIONS.filter((x) => x.id !== "internal" && x.id !== "competitors" && !x.fields.some((f) => filled(c, f.key))).map((x) => x.name);
const LIBRARIES = [["basics", "Brand basics"], ["voice", "Brand voice"], ["creatives", "Reference creatives"], ["offers", "Offers and prices"], ["hashtags", "Hashtags and caption style"], ["contacts", "Contacts and approval"], ["ads", "Ads info"], ["seo", "SEO"]];
function libraryPct(c, id) {
  if (id === "creatives") {
    const refs = (st.ws?.refs || []).filter((r) => r.clientId === c.id);
    const ex = (st.ws?.examples || []).filter((e) => e.clientId === c.id);
    const got = (refs.length ? 1 : 0) + (ex.some((e) => e.verdict === "approved") ? 1 : 0) + (refs.some((r) => r.verdict === "do" || r.verdict === "dont") ? 1 : 0);
    return Math.round(100 * got / 3);
  }
  const fields = SECTIONS.filter((s) => s.lib === id).flatMap((s) => s.fields);
  if (!fields.length) return 0;
  return Math.round(100 * fields.filter((f) => filled(c, f.key)).length / fields.length);
}
function libraryBars(c) {
  return `<div class="lib-bars">${LIBRARIES.map(([id, name]) => { const n = libraryPct(c, id); return `<div class="lib-bar"><small><span>${esc(name)}</span><b>${n}%</b></small>${progress(n, { label: name })}</div>`; }).join("")}</div>`;
}
function suggestionBox(c) {
  const rows = (st.ws?.suggestions || []).filter((s) => s.clientId === c.id);
  if (!rows.length || !canEdit()) return "";
  return `<div class="suggestion-box">${rows.map((s) => `<span>Possible alias: <b>${esc(s.suggestion)}</b></span>${btn("Accept", { size: "sm", a: reg(async () => { await api("/br/suggestions/" + s.id, { accept: true }); await load(); toast.success("Added to aliases"); }) })}${btn("Reject", { size: "sm", variant: "ghost", a: reg(async () => { await api("/br/suggestions/" + s.id, { accept: false }); await load(); }) })}`).join("")}</div>`;
}
function bundle(c, examples, platform = "Instagram", language = "English") {
  const brand = Object.fromEntries(Object.entries(c.fields).filter(([k]) => k !== "internalNotes" && !c.internalFields.includes(k)));
  return { client: c.name, platform, language, brand, examples: examples.filter((e) => e.clientId === c.id && !e.internal).slice(0, 8).map((e) => ({ verdict: e.verdict, text: e.text, reason: e.reason })) };
}
const mark = (c, size = "") => `<div class="brand-mark ${size}" style="--brand: ${esc(c.colour)};">${esc(initials(c.name))}</div>`;
const peach = (name) => (String(name || "").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) % 2 ? "peach" : "");
const pageHead = (eyebrow, title, desc, actions = "") => `<div class="page-head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}<h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${actions ? `<div class="head-actions">${actions}</div>` : ""}</div>`;
const empty = (icon, title, desc, inner = "") => `<div class="empty">${ic(icon, { size: 30 })}<h3>${title}</h3><p>${desc}</p>${inner}</div>`;
const spin = (size) => ic("loader-circle", { size: size || 24, cls: "spin" });

/* ================= state ================= */
const st = { me: null, ws: null, cfg: {}, pub: null, err: "", view: "clients", clientId: null, section: "voice", dialog: null, mobileOpen: false };
const lib = { q: "", tab: "All clients", sort: "Recently updated", mode: "grid" };
const det = { ctx: null, ctxKey: "", ctxLoading: null, tab: "overview", platform: "Instagram", language: "English", forId: null };
const ed = { draft: null, dirty: false, saving: false, error: "", forId: null, qi: null, focusQ: false, intake: null, queue: [] };
const exs = { tab: "All examples", client: "all", q: "", busy: null };
const sets = { tab: "connections" };
const refsState = { kind: "Logo", description: "", verdict: "", why: "", onedrive: "", platform: "Instagram", file: null, busy: false, error: "" };
const REF_KINDS = ["Logo", "Logo variant", "Product", "Packaging", "Location", "Past creative", "Reference"];

async function load() {
  const ws = await api("/br/workspace"); st.ws = ws; st.me = ws.me; st.cfg = ws.config || {}; st.err = ""; return ws;
}
// Where a reference image is served from, and which extra links the account menu shows,
// differ between the local app and the hosted one. The server tells us in workspace.config.
const refUrl = (id) => (st.cfg.refBase || "/api/ck/refs/") + id + "/file";
async function refresh() { await load(); renderShell(); }
const VIEWS = ["clients", "client", "editor", "documents", "examples", "activity", "agency", "skills", "onboarding", "keys", "settings"];
function go(view, id) {
  if (st.view === "editor" && ed.dirty && view !== "editor") { confirmLeave(() => { ed.dirty = false; go(view, id); }); return; }
  if (st.view === "editor" && view !== "editor") ed.draft = null;
  st.view = view; if (id) st.clientId = id; st.mobileOpen = false;
  const h = "#" + view + (id ? "/" + encodeURIComponent(id) : "");
  if (location.hash !== h) history.pushState(null, "", h);
  renderShell(); window.scrollTo({ top: 0, behavior: "instant" });
}
window.addEventListener("popstate", () => { readHash(); if (!st.ws) return; renderShell(); window.scrollTo({ top: 0, behavior: "instant" }); });
function readHash() { const [v, id] = location.hash.slice(1).split("/"); if (VIEWS.includes(v)) { st.view = v; if (id) st.clientId = decodeURIComponent(id); } else st.view = "clients"; }
window.addEventListener("beforeunload", (e) => { if (st.view === "editor" && ed.dirty) { e.preventDefault(); e.returnValue = ""; } });
const curClient = () => st.ws?.clients.find((c) => c.id === st.clientId);
const canEdit = () => !!st.me?.canEdit;

/* ================= shell ================= */
const MENU_BTN = "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm";
const GROUP_LABEL = "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0";
const ROLE = { admin: "Admin", head: "Head", staff: "Staff" };
function sidebarInner() {
  const ws = st.ws; const v = st.view;
  const item = ([key, label, icon]) => `<li data-slot="sidebar-menu-item" data-sidebar="menu-item" class="group/menu-item relative"><button data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size="default" data-active="${v === key || (key === "clients" && ["client", "editor"].includes(v))}" class="${MENU_BTN}" data-a="${reg(() => go(key))}">${ic(icon)}<span>${label}</span></button></li>`;
  const group = (label, items) => `<div data-slot="sidebar-group" data-sidebar="group" class="relative flex w-full min-w-0 flex-col p-2"><div data-slot="sidebar-group-label" data-sidebar="group-label" class="${GROUP_LABEL}">${label}</div><ul data-slot="sidebar-menu" data-sidebar="menu" class="flex w-full min-w-0 flex-col gap-1">${items.map(item).join("")}</ul></div>`;
  const me = st.me || {};
  return `<div data-slot="sidebar-header" data-sidebar="header" class="flex flex-col gap-2 p-2"><button class="wordmark" data-a="${reg(() => go("clients"))}"><span class="app-mark">${ic("book-open", { size: 22 })}</span><span>brandroom<span class="wordmark-sub">BY CREATIVHEADS®</span></span></button><div class="workspace-name"><span class="workspace-logo">CH</span><span>CreativHeads Agency<small>Team workspace</small></span>${ic("chevrons-up-down", { size: 15 })}</div></div>
  <div data-slot="sidebar-content" data-sidebar="content" class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">${group("WORKSPACE", [["clients", "Clients", "layers"], ["documents", "Documents", "file-text"], ["agency", "Agency libraries", "shield-check"], ["skills", "Skills", "list"], ["onboarding", "Onboarding", "sparkles"]])}${group("MANAGE", [["activity", "Activity", "clock-3"]].concat(me.isAdmin ? [["keys", "Bot keys", "shield-check"]] : []).concat([["settings", "Settings", "settings-2"]]))}</div>
  <div data-slot="sidebar-footer" data-sidebar="footer" class="flex flex-col gap-2 p-2">
  <div class="account"><span class="avatar admin">${esc((me.name || "?")[0].toUpperCase())}</span><span><b>${esc(me.name || "")}</b><small>${esc(ROLE[me.role] || "Team")} · CreativHeads</small></span>${pill(esc((ROLE[me.role] || "TEAM").toUpperCase()))}</div></div>`;
}
const TITLES = { clients: "Clients", editor: "Edit brand", documents: "Documents", examples: "Examples library", activity: "Activity", agency: "Agency libraries", skills: "Skills", onboarding: "Onboarding", keys: "Bot keys", settings: "Settings" };
function renderShell() {
  closePopover(); REG = new Map(); if (st.dialog) renderDialog();
  const app = $("#app"); const ws = st.ws; const c = curClient();
  const crumb = st.view === "client" ? c?.name || "Client" : TITLES[st.view];
  let main = "";
  if (!ws && !st.err) main = `<div class="loading-layout"><div data-slot="skeleton" class="animate-pulse rounded-md bg-accent h-9 w-64"></div><div data-slot="skeleton" class="animate-pulse rounded-md bg-accent h-20 w-full"></div><div class="client-grid">${[1, 2, 3, 4, 5, 6].map(() => `<div data-slot="skeleton" class="animate-pulse rounded-md bg-accent h-60 w-full"></div>`).join("")}</div></div>`;
  else if (st.err) main = empty("circle-alert", "Let’s try that again", esc(st.err), btn("Reload workspace", { a: reg(() => load().then(renderShell).catch((e) => { st.err = e.message; renderShell(); })) }));
  else if (st.view === "clients") main = viewClients();
  else if (["client", "editor"].includes(st.view) && !c) main = empty("search", "Client not found", "This brand may have been removed.", btn("Back to clients", { a: reg(() => go("clients")) }));
  else if (st.view === "client") main = viewClient(c);
  else if (st.view === "editor") main = viewEditor(c);
  else if (st.view === "documents") main = viewAllDocuments();
  else if (st.view === "examples") main = viewExamples();
  else if (st.view === "activity") main = viewActivity();
  else if (st.view === "agency") main = viewAgency();
  else if (st.view === "skills") main = viewSkills();
  else if (st.view === "onboarding") main = viewOnboarding();
  else if (st.view === "keys") main = viewKeys();
  else if (st.view === "settings") main = viewSettings();
  const sheet = st.mobileOpen ? `<div data-state="open" data-slot="sheet-overlay" class="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" data-a="${reg(() => { st.mobileOpen = false; renderShell(); })}"></div><div role="dialog" data-state="open" data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" class="fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500 inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground app-sidebar" style="--sidebar-width: 18rem;"><div class="flex h-full w-full flex-col">${sidebarInner()}</div></div>` : "";
  app.innerHTML = `<div data-slot="sidebar-wrapper" style="--sidebar-width:244px;--sidebar-width-icon:3rem" class="group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar"><div class="group peer hidden text-sidebar-foreground md:block" data-state="expanded" data-collapsible="" data-variant="sidebar" data-side="left" data-slot="sidebar"><div data-slot="sidebar-gap" class="relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-(--sidebar-width-icon)"></div><div data-slot="sidebar-container" class="fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l app-sidebar"><div data-sidebar="sidebar" data-slot="sidebar-inner" class="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm">${sidebarInner()}</div></div></div>${sheet}
  <div class="app-body"><header class="topbar"><div class="breadcrumbs">${btn(ic("panel-left") + '<span class="sr-only">Toggle Sidebar</span>', { variant: "ghost", size: "icon", cls: "size-7 mobile-menu", a: reg(() => { st.mobileOpen = !st.mobileOpen; renderShell(); }), attrs: 'data-sidebar="trigger"' })}<span>Workspace</span>${ic("chevron-right", { size: 14 })}<strong>${esc(crumb)}</strong></div><div class="topbar-right"><span class="sample-label">TEAM WORKSPACE</span><button class="guide-button" data-a="${reg(openGuide)}">${ic("info", { size: 16 })}<span>Brandroom guide</span></button><button class="avatar small br-avatar-btn" aria-label="Account menu" data-a="${reg((e, el) => openMenu(el))}">${esc((st.me?.name || "?")[0].toUpperCase())}</button></div></header>
  <main class="main-content">${main}</main><footer class="workspace-footer"><span>CreativHeads® Agency</span><span>Made for a little more clarity.</span><button data-a="${reg(openGuide)}">Brandroom ${ic("info", { size: 12 })}</button></footer></div></div>`;
  afterRender();
}
let afterHooks = [];
function afterRender() { const h = afterHooks; afterHooks = []; h.forEach((f) => f()); }

// The writing context comes from the server, so the tab shows what the bot really reads.
async function loadContext(c) {
  const key = c.id + det.platform + det.language;
  if (det.ctxLoading === key) return;
  det.ctxLoading = key;
  try {
    det.ctx = await api(`/br/context?client=${encodeURIComponent(c.id)}&platform=${encodeURIComponent(det.platform)}&language=${encodeURIComponent(det.language)}`);
    det.ctxKey = key;
  } catch (e) { det.ctx = { error: e.message }; det.ctxKey = key; }
  finally { det.ctxLoading = null; if (st.view === "client" && det.tab === "bundle") renderShell(); }
}

/* Documents: the file is kept, and the words inside it become brand knowledge the bot reads. */
const docState = { file: null, busy: false, error: "", busyId: null, openId: null, text: "" };
const fileSize = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
const DOC_TYPES = "application/pdf,text/plain,text/markdown,text/csv,.pdf,.txt,.md,.csv";

function viewDocuments(c) {
  const D = docState;
  const list = (st.ws.documents || []).filter((d) => d.clientId === c.id);
  const readable = list.filter((d) => d.status === "ready" && !d.internal);
  const totalChars = readable.reduce((a, d) => a + d.chars, 0);
  afterHooks.push(() => {
    const f = $("#doc-file");
    if (f) f.onchange = () => { const x = f.files?.[0]; D.file = x || null; D.error = ""; renderShell(); };
  });
  const badge = (d) => d.internal ? pill("Team only", "draft")
    : d.status === "ready" ? pill(`${d.chars.toLocaleString()} characters read`, "ready")
    : pill(d.status === "no_text" ? "No text found" : "Could not be read", "rejected");
  return `<div class="bundle-head"><div><h2>What this brand has written down.</h2><p>Brand guides, price lists, FAQs. The words inside become part of the brand knowledge.</p></div>${pill(`${list.length} document${list.length === 1 ? "" : "s"}`)}</div>
  <div class="doc-layout">
    ${canEdit() ? `<form class="doc-upload panel" data-sub="${reg(() => uploadDoc(c))}">
      <label class="dropzone">${ic("upload", { size: 26 })}<b>${esc(D.file ? D.file.name : "Choose a document")}</b><span>PDF, text, Markdown or CSV · up to 3 MB</span>
      <input type="file" id="doc-file" accept="${DOC_TYPES}" aria-label="Document"></label>
      ${D.error ? `<p class="error-text">${esc(D.error)}</p>` : ""}
      ${btn((D.busy ? spin() : ic("upload")) + (D.busy ? "Reading the file…" : "Add document"), { type: "submit", disabled: !D.file || D.busy })}
      <p class="field-help">A PDF made of scans holds pictures of text, so nothing can be read from it. Those are kept as files only.</p>
    </form>` : ""}
    <div class="doc-list">
      ${list.length ? list.map((d) => `<div class="doc-row panel">
        <span class="doc-icon">${ic(d.kind === "PDF" ? "file-text" : "braces", { size: 20 })}</span>
        <div class="doc-main"><b>${esc(d.name)}</b><small>${esc(d.kind)} · ${fileSize(d.size)}${d.pages ? ` · ${d.pages} page${d.pages === 1 ? "" : "s"}` : ""} · ${dm(d.createdAt)}</small>${d.note ? `<p class="doc-note">${esc(d.note)}</p>` : ""}${docTextBlock(d)}</div>
        <div class="doc-side">${badge(d)}
          <div class="doc-actions">
            <a class="text-button" href="/api/br/documents/${d.id}/file" target="_blank" rel="noreferrer">Open</a>
            ${canEdit() ? `<label class="lock-control">${ic("lock", { size: 12 })}<span>Team only</span>${toggle(d.internal, reg(() => toggleDoc(d)), { size: "sm", label: `Keep ${d.name} from the bot` })}</label>` : ""}
            ${canEdit() ? `<button class="text-button danger" data-a="${reg(() => removeDoc(d))}"${D.busyId === d.id ? " disabled" : ""}>Remove</button>` : ""}
          </div>
        </div></div>`).join("") : empty("file-text", "Nothing written down yet.", "Add a brand guide, price list or FAQ, and the bot can use what is inside it.")}
      ${readable.length ? `<p class="doc-total">${ic("circle-check", { size: 14 })}${totalChars.toLocaleString()} characters of document text are saved with this brand. Team-only documents are kept out of the writing context.</p>` : ""}
    </div>
  </div>`;
}
/* Every client's documents in one place, with upload from here. */
const allDocs = { client: "all", q: "", target: "" };
function viewAllDocuments() {
  const ws = st.ws, D = docState, A = allDocs;
  const active = ws.clients.filter((c) => c.status === "active");
  if (!A.target || !active.some((c) => c.id === A.target)) A.target = active[0]?.id || "";
  const q = A.q.toLowerCase();
  const list = (ws.documents || [])
    .filter((d) => (A.client === "all" || d.clientId === A.client) && d.name.toLowerCase().includes(q));
  const readable = list.filter((d) => d.status === "ready" && !d.internal);
  const target = active.find((c) => c.id === A.target);
  afterHooks.push(() => {
    const f = $("#alldoc-file");
    if (f) f.onchange = () => { D.file = f.files?.[0] || null; D.error = ""; renderShell(); };
    const s = $("#alldoc-q");
    if (s) s.addEventListener("input", () => { A.q = s.value; const p = s.selectionStart; renderShell(); const n = $("#alldoc-q"); n.focus(); n.setSelectionRange(p, p); });
  });
  const badge = (d) => d.internal ? pill("Team only", "draft")
    : d.status === "ready" ? pill(`${d.chars.toLocaleString()} characters read`, "ready")
    : pill(d.status === "no_text" ? "No text found" : "Could not be read", "rejected");
  return `${pageHead("WHAT YOUR BRANDS HAVE WRITTEN DOWN", "The facts, in their own words.", "Brand guides, price lists and FAQs. The words inside become part of the brand knowledge.")}
  <div class="examples-toolbar"><div class="inline-options"><div class="searchbox">${ic("search", { size: 16 })}${input({ id: "alldoc-q", value: A.q, placeholder: "Search document names…", attrs: 'aria-label="Search documents"' })}</div>${select(A.client, [{ value: "all", label: "All clients" }, ...ws.clients.map((c) => ({ value: c.id, label: c.name }))], (v) => { A.client = v; renderShell(); }, { label: "Filter documents by client" })}</div><span class="doc-count">${readable.reduce((a, d) => a + d.chars, 0).toLocaleString()} characters available to the bot</span></div>
  <div class="doc-layout">
    ${canEdit() ? `<form class="doc-upload panel" data-sub="${reg(() => uploadDoc(target, true))}">
      <h3 class="doc-upload-title">Add a document</h3>
      <div class="form-field"><label>Client</label>${select(A.target, active.map((c) => ({ value: c.id, label: c.name })), (v) => { A.target = v; renderShell(); }, { label: "Client for this document" })}</div>
      <label class="dropzone">${ic("upload", { size: 26 })}<b>${esc(D.file ? D.file.name : "Choose a document")}</b><span>PDF, text, Markdown or CSV · up to 3 MB</span>
      <input type="file" id="alldoc-file" accept="${DOC_TYPES}" aria-label="Document"></label>
      ${D.error ? `<p class="error-text">${esc(D.error)}</p>` : ""}
      ${btn((D.busy ? spin() : ic("upload")) + (D.busy ? "Reading the file…" : "Add document"), { type: "submit", disabled: !D.file || D.busy || !target })}
      <p class="field-help">A PDF made of scans holds pictures of text, so nothing can be read from it.</p>
    </form>` : ""}
    <div class="doc-list">
      ${list.length ? list.map((d) => { const c = ws.clients.find((x) => x.id === d.clientId); return `<div class="doc-row panel">
        <span class="doc-icon">${ic(d.kind === "PDF" ? "file-text" : "braces", { size: 20 })}</span>
        <div class="doc-main"><b>${esc(d.name)}</b><small>${c ? `<button class="text-button" data-a="${reg(() => go("client", c.id))}">${esc(c.name)}</button> · ` : ""}${esc(d.kind)} · ${fileSize(d.size)}${d.pages ? ` · ${d.pages} page${d.pages === 1 ? "" : "s"}` : ""} · ${dm(d.createdAt)}</small>${d.note ? `<p class="doc-note">${esc(d.note)}</p>` : ""}${docTextBlock(d)}</div>
        <div class="doc-side">${badge(d)}
          <div class="doc-actions">
            <a class="text-button" href="/api/br/documents/${d.id}/file" target="_blank" rel="noreferrer">Open</a>
            ${canEdit() ? `<label class="lock-control">${ic("lock", { size: 12 })}<span>Team only</span>${toggle(d.internal, reg(() => toggleDoc(d)), { size: "sm", label: `Keep ${d.name} from the bot` })}</label>` : ""}
            ${canEdit() ? `<button class="text-button danger" data-a="${reg(() => removeDoc(d))}"${D.busyId === d.id ? " disabled" : ""}>Remove</button>` : ""}
          </div>
        </div></div>`; }).join("") : empty("file-text", A.q || A.client !== "all" ? "Nothing matches" : "Nothing written down yet.", A.q || A.client !== "all" ? "Try another name, or show all clients." : "Add a brand guide, price list or FAQ, and the bot can use what is inside it.")}
    </div>
  </div>`;
}
function docTextBlock(d) {
  if (d.status !== "ready") return "";
  const open = docState.openId === d.id;
  return `<button type="button" class="text-button" data-a="${reg(() => showDocText(d))}">${open ? "Hide text" : "Show the text that was read"}</button>${open ? `<pre class="doc-text">${esc(docState.text || "")}</pre>` : ""}`;
}
async function showDocText(d) {
  if (docState.openId === d.id) { docState.openId = null; docState.text = ""; return renderShell(); }
  docState.openId = d.id; docState.text = "Reading…"; renderShell();
  try { const r = await api(`/br/documents/${d.id}/text`); docState.text = r.text || "Nothing was read from this file."; }
  catch (e) { docState.text = e.message; }
  renderShell();
}
async function uploadDoc(c) {
  if (!c) return;
  const D = docState;
  if (!D.file || D.busy) return;
  if (D.file.size > 3 * 1024 * 1024) { D.error = "That file is over 3 MB. Please use a smaller one."; return renderShell(); }
  D.busy = true; D.error = ""; renderShell();
  try {
    const data = await blobB64(D.file);
    const mime = D.file.type || (/\.md$/i.test(D.file.name) ? "text/markdown" : /\.csv$/i.test(D.file.name) ? "text/csv" : /\.txt$/i.test(D.file.name) ? "text/plain" : "application/pdf");
    const r = await api("/br/documents", { clientId: c.id, name: D.file.name, mime, data });
    await load();
    D.file = null;
    const d = r.document;
    d.status === "ready" ? toast.success(`Read ${d.chars.toLocaleString()} characters from ${d.name}`) : toast.error(d.note || "The file was saved, but nothing could be read from it.");
  } catch (e) { D.error = e.message; } finally { D.busy = false; renderShell(); }
}
async function toggleDoc(d) {
  try { await api(`/br/documents/${d.id}`, { internal: !d.internal }); await load(); renderShell(); }
  catch (e) { toast.error(e.message); }
}
function removeDoc(d) {
  openDialog(() => `${alertHeader(`Remove ${esc(d.name)}?`, "The file and the text read from it are deleted. The bot stops using it straight away.")}${alertFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog) }) + btn("Remove document", { a: reg(async () => {
    closeDialog(); docState.busyId = d.id; renderShell();
    try { await apiDelete(`/br/documents/${d.id}`); await load(); toast.success("Document removed"); }
    catch (e) { toast.error(e.message); } finally { docState.busyId = null; renderShell(); }
  }) }))}`, { alert: true });
}
function viewNotes() { return empty("message-square", "Team Notes", "Internal discussions and updates for the team."); }
function viewAssets() { return empty("image", "Brand Assets", "Manage logos, imagery, and visual guidelines."); }

/* account menu */
let menuEl = null;
function closeMenu() { menuEl?.remove(); menuEl = null; }
function openMenu(anchor) {
  closeMenu(); const r = anchor.getBoundingClientRect(); const m = document.createElement("div"); m.className = "br-menu"; m.style.cssText = `position:fixed;top:${r.bottom + 8}px;right:${window.innerWidth - r.right}px;z-index:60`;
  const me = st.me || {};
  const links = st.cfg.cloud
    ? (st.cfg.seoUrl ? `<a class="br-menu-item" href="${esc(st.cfg.seoUrl)}" target="_blank" rel="noreferrer">${ic("external-link", { size: 15 })}SEO workspace</a>` : "")
    : `${(me.spaces || []).includes("seo") ? `<a class="br-menu-item" href="/seo/">${ic("external-link", { size: 15 })}SEO workspace</a>` : ""}<a class="br-menu-item" href="/classic/">${ic("external-link", { size: 15 })}Full settings &amp; tools</a>`;
  m.innerHTML = `<div class="br-menu-head"><b>${esc(me.name)}</b><small>${esc(me.email)}</small></div>${links}<button class="br-menu-item" id="br-logout">${ic("log-out", { size: 15 })}Sign out</button>`;
  document.body.appendChild(m); menuEl = m;
  m.querySelector("#br-logout").onclick = async () => { closeMenu(); try { await fetch("/api/logout", { method: "POST", headers: { "x-requested-with": "app", "x-section": "kb" } }); } catch {} st.me = null; st.ws = null; renderLogin(); };
  setTimeout(() => document.addEventListener("mousedown", function h(e) { if (menuEl && !menuEl.contains(e.target)) { closeMenu(); document.removeEventListener("mousedown", h); } }), 0);
}

function openGuide() {
  openDialog(() => `${dlgHeader("Welcome to Brandroom.", "Every brand’s knowledge, in one place.", `<span class="large-app-mark">${ic("book-open")}</span>`)}
  <div class="guide-list"><div>${ic("circle-check")}<p><b>Build your brand knowledge</b><span>Add clients and fill in each section: voice, audience, products, rules and more. Changes are saved straight away.</span></p></div>
  <div>${ic("file-text")}<p><b>Add documents and images</b><span>Upload brand guides, price lists and logos. The words inside documents are read and kept with the brand.</span></p></div>
  <div>${ic("lock")}<p><b>Keep some things private</b><span>Mark any field or document as internal and it stays with your team, out of the writing context.</span></p></div></div>
  <div class="notice">Internal notes and locked fields are never included in the writing context.</div>${dlgFooter(btn("Explore the workspace", { a: reg(closeDialog) }))}`, { cls: "guide-dialog" });
}
function confirmLeave(onDiscard) {
  openDialog(() => `${alertHeader("Leave without saving?", "Your recent edits have not been saved.")}${alertFooter(btn("Keep editing", { variant: "outline", a: reg(closeDialog) }) + btn("Discard changes", { a: reg(() => { closeDialog(); onDiscard(); }) }))}`, { alert: true });
}

/* ================= Clients ================= */
function viewClients() {
  const ws = st.ws; const active = ws.clients.filter((c) => c.status === "active"); const ready = active.filter((c) => score(c) >= 80);
  const avg = active.length ? Math.round(active.reduce((a, c) => a + score(c), 0) / active.length) : 0;
  const add = canEdit() ? btn(ic("plus", { size: 16 }) + "Add client", { size: "lg", a: reg(openAddClient) }) : "";
  const metric = (cls, icon, label, n, small) => `<div><span class="metric-icon ${cls}">${ic(icon)}</span><p>${label}<strong>${n}<small>${small}</small></strong></p></div>`;
  afterHooks.push(bindLibrarySearch);
  return `${pageHead("YOUR BRAND KNOWLEDGEBASE", "Good work starts with context.", "Every brand’s voice, details and direction. All in one place.", add)}
  <div class="metrics">${metric("blue", "layers", "Total clients", active.length, "active brands")}${metric("green", "check-check", "Complete profiles", ready.length, "80%+ complete")}${metric("orange", "file-text", "Need a little more context", active.length - ready.length, "brands to complete")}${metric("violet", "book-open", "Approved examples", ws.examples.filter((e) => e.verdict === "approved").length, "voices to learn from")}</div>
  <div class="workspace-columns"><section class="clients-area"><div class="section-title"><h2>Client library <span>${active.length}</span></h2><div class="view-toggle">${btn(ic("layout-grid"), { variant: "ghost", size: "icon-sm", cls: lib.mode === "grid" ? "selected" : "", a: reg(() => { lib.mode = "grid"; renderShell(); }), attrs: 'aria-label="Grid view"' })}${btn(ic("list"), { variant: "ghost", size: "icon-sm", cls: lib.mode === "list" ? "selected" : "", a: reg(() => { lib.mode = "list"; renderShell(); }), attrs: 'aria-label="List view"' })}</div></div>
  <div class="filter-bar"><div class="searchbox">${ic("search", { size: 17 })}${input({ id: "lib-q", value: lib.q, placeholder: "Search clients, products, examples…", attrs: 'aria-label="Search clients"' })}<button aria-label="Clear search" id="lib-clear"${lib.q ? "" : " hidden"}>${ic("x", { size: 14 })}</button></div>${select(lib.sort, ["Recently updated", "Incomplete first", "Name A–Z"], (v) => { lib.sort = v; renderShell(); }, { label: "Sort clients" })}</div>
  ${tabs(lib.tab, ["All clients", "Needs attention", "Complete", "Archived"].map((x) => [x, x]), (v) => { lib.tab = v; renderShell(); }, { cls: "filter-tabs" })}
  <div id="lib-results">${libraryResults()}</div><div class="library-note">${ic("shield-check", { size: 15 })}<span>One shared source of truth. Internal notes stay with your team.</span></div></section>
  <aside class="insights-rail"><div class="rail-section"><div class="section-title"><h3>Workspace health</h3>${ic("info", { size: 14 })}</div><div class="health-number">${avg}<span>%</span>${pill("Average readiness", "ready")}</div>${progress(avg, { label: "Average completeness" })}<p>Aim for 80% so every brand is properly documented.</p>
  ${active.filter((c) => score(c) < 80).slice(0, 2).map((c) => `<button class="attention-row" data-a="${reg(() => editClient(c, SECTIONS.find((s) => missing(c).includes(s.name))?.id))}">${mark(c, "mini")}<span><b>${esc(c.name)}</b><small>${missing(c).length} sections to complete</small></span>${ic("chevron-right", { size: 15 })}</button>`).join("")}</div>
  <div class="rail-section"><div class="section-title"><h3>Recent activity</h3><button class="text-button" data-a="${reg(() => go("activity"))}">View all</button></div>${ws.activities.slice(0, 3).map((a) => `<div class="mini-activity"><span class="event-dot"></span><div><p>${esc(a.text)}</p><small>${dm(a.createdAt)} · ${esc(a.actor || "Workspace admin")}</small></div></div>`).join("")}</div></aside></div>`;
}
function libraryList() {
  const ws = st.ws; const q = lib.q.toLowerCase();
  return ws.clients.filter((c) => (lib.tab === "Archived" ? c.status === "archived" : c.status === "active") && (lib.tab !== "Needs attention" || score(c) < 80) && (lib.tab !== "Complete" || score(c) >= 80) &&
    [c.name, c.industry, ...Object.entries(c.fields).filter(([k]) => k !== "internalNotes").map(([, v]) => v), ...ws.examples.filter((e) => e.clientId === c.id).map((e) => e.text)].join(" ").toLowerCase().includes(q))
    .sort((a, b) => (lib.sort === "Incomplete first" ? score(a) - score(b) : lib.sort === "Name A–Z" ? a.name.localeCompare(b.name) : b.updatedAt.localeCompare(a.updatedAt)));
}
function libraryResults() {
  const list = libraryList();
  if (!list.length) return empty("search", "No clients here yet", lib.q ? "Try another name, product or phrase." : "Add a brand to start building its knowledgebase.", !lib.q && canEdit() ? btn(ic("plus") + "Add client", { a: reg(openAddClient) }) : "");
  if (lib.mode === "grid") return `<div class="client-grid">${list.map((c) => { const n = score(c), m = missing(c); return `<button class="client-card" data-a="${reg(() => go("client", c.id))}"><div class="card-top">${mark(c)}${pill((n >= 80 ? ic("check", { size: 12 }) : '<span class="tiny-dot"></span>') + (c.status === "archived" ? "Archived" : n >= 80 ? "Complete" : "In progress"), n >= 80 ? "ready" : "draft")}</div><h3>${esc(c.name)}</h3><p class="industry">${esc(c.industry)}</p><div class="card-readiness"><span>Brand knowledge</span><b>${n}%</b></div>${progress(n, { cls: n >= 80 ? "complete" : "", label: `${c.name} ${n}% complete` })}<div class="card-missing">${m.length ? `<span class="missing-label">Missing</span><span>${esc(m[0])}${m.length > 1 ? ` +${m.length - 1}` : ""}</span>` : `<span class="complete-copy">${ic("circle-check", { size: 13 })}All sections covered</span>`}</div><div class="card-footer"><span><span class="avatar tiny ${peach(c.lead)}">${esc((c.lead || "S")[0])}</span>${esc(c.lead || "Unassigned")}</span><span>${dm(c.updatedAt)}</span></div></button>`; }).join("")}${canEdit() ? `<button class="add-card" data-a="${reg(openAddClient)}"><span>${ic("plus", { size: 24 })}</span><b>A new brand, a new story.</b><small>Add a client to your workspace</small></button>` : ""}</div>`;
  const th = (t) => `<th data-slot="table-head" class="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">${t}</th>`;
  return `<div class="panel">${table([th("Client"), th("Account lead"), th("Completeness"), th("")].join(""), list.map((c) => row([`<button class="table-brand" data-a="${reg(() => go("client", c.id))}">${mark(c, "mini")}${esc(c.name)}</button>`, esc(c.lead), score(c) + "%", btn("Open", { variant: "ghost", a: reg(() => go("client", c.id)) })])).join(""))}</div>`;
}
const TD = "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]";
const row = (cells) => `<tr data-slot="table-row" class="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted">${cells.map((x) => `<td data-slot="table-cell" class="${TD}">${x}</td>`).join("")}</tr>`;
const table = (head, body) => `<div data-slot="table-container" class="relative w-full overflow-x-auto"><table data-slot="table" class="w-full caption-bottom text-sm"><thead data-slot="table-header" class="[&_tr]:border-b"><tr data-slot="table-row" class="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted">${head}</tr></thead><tbody data-slot="table-body" class="[&_tr:last-child]:border-0">${body}</tbody></table></div>`;
const thc = (t) => `<th data-slot="table-head" class="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">${t}</th>`;
function bindLibrarySearch() {
  const inp = $("#lib-q"), clear = $("#lib-clear"); if (!inp) return;
  inp.addEventListener("input", () => { lib.q = inp.value; clear.hidden = !lib.q; $("#lib-results").innerHTML = libraryResults(); });
  clear.addEventListener("click", () => { lib.q = ""; inp.value = ""; clear.hidden = true; $("#lib-results").innerHTML = libraryResults(); inp.focus(); });
}
function editClient(c, section = "voice") { st.section = section || "voice"; ed.forId = null; go("editor", c.id); }

/* add client dialog */
function openAddClient() {
  const team = st.ws.team.map((t) => t.name); const f = { name: "", industry: "", lead: st.me?.name && team.includes(st.me.name) ? st.me.name : team[0] || "", busy: false, error: "" };
  const render = () => `${dlgHeader("Add a new client", "Start with the basics. Build the brand knowledge one section at a time.")}<form data-sub="${reg(submit)}"><div class="form-field"><label for="new-name">Client name</label>${input({ id: "new-name", value: f.name, placeholder: "e.g. Whitestone", inp: reg((v) => { f.name = v; $("#new-create").disabled = f.busy || !v.trim(); }), attrs: 'required maxlength="100"' })}</div><div class="form-field"><label for="new-industry">Industry</label>${input({ id: "new-industry", value: f.industry, placeholder: "e.g. Architecture & surfaces", inp: reg((v) => (f.industry = v)), attrs: 'maxlength="100"' })}</div><div class="form-field"><label>Account lead</label>${select(f.lead, team.length ? team : ["Unassigned"], (v) => { f.lead = v; renderDialog(); }, { label: "Account lead" })}</div>${f.error ? `<p class="error-text" role="alert">${esc(f.error)}</p>` : ""}${dlgFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog), disabled: f.busy }) + btn((f.busy ? spin() : ic("plus")) + "Create client", { type: "submit", disabled: f.busy || !f.name.trim(), attrs: 'id="new-create"' }))}</form>`;
  async function submit() {
    if (!f.name.trim()) return; f.busy = true; f.error = ""; st.dialog.locked = true; renderDialog();
    try { const r = await act({ action: "client.save", client: { id: uuid(), name: f.name.trim(), industry: f.industry.trim(), location: "", lead: f.lead, colour: "#526bc4", status: "active", fields: {}, internalFields: ["internalNotes"] } });
      await load(); st.dialog.locked = false; closeDialog(); toast.success("Client added"); editClient(r.client, "basics"); }
    catch (e) { f.error = e.message; f.busy = false; if (st.dialog) { st.dialog.locked = false; renderDialog(); } }
  }
  openDialog(render);
}

/* ================= Client detail ================= */
function briefBit(v, n = 160) {
  const s = String(v || "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
}
const READ_ORDER = ["messages", "basics", "audience", "products", "voice", "words", "languages", "social", "platforms", "offers", "seasonal", "compliance", "recognition", "contacts", "ads", "seo", "assets", "competitors"];
function kbSections(c) {
  const byId = new Map(SECTIONS.map((s) => [s.id, s]));
  return READ_ORDER.map((id) => byId.get(id)).filter((s) => s && s.id !== "internal" && (canEdit() || s.id !== "competitors")).map((s) => {
    const fields = s.fields.filter((f) => String(c.fields[f.key] || "").trim());
    return { ...s, fields, filled: fields.length > 0 };
  });
}
function jumpKb(id) { document.getElementById("kb-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
function kbSummaryText(c) {
  const f = c.fields || {};
  const about = String(f.about || "").replace(/\s+/g, " ").trim();
  const known = String(f.usps || "").split(/\n/).map((s) => s.trim()).filter(Boolean).join(", ");
  const where = String(f.address || c.location || "").replace(/\s+/g, " ").trim();
  const parts = [];
  if (about) parts.push(about);
  else if (f.tagline) parts.push(String(f.tagline).trim());
  if (known && !about.toLowerCase().includes(known.slice(0, 24).toLowerCase())) parts.push(known.endsWith(".") ? known : known + ".");
  if (where && !about.toLowerCase().includes(where.split("|")[0].trim().toLowerCase())) parts.push(where + ".");
  return parts.join(" ");
}
function kbArticle(c) {
  const all = kbSections(c);
  const filled = all.filter((s) => s.filled);
  const empty = all.filter((s) => !s.filled);
  const summary = kbSummaryText(c);
  const lead = summary
    ? `<div class="kb-summary"><div class="eyebrow">OVERVIEW</div><p>${esc(summary)}</p></div>`
    : `<p class="not-added">The overview appears here once the first facts are saved.</p>`;
  if (!filled.length) return lead;
  const jump = `<div class="kb-jump">${filled.map((s) => `<button type="button" data-a="${reg(() => jumpKb(s.id))}">${esc(s.name)}</button>`).join("")}</div>`;
  const grid = `<div class="knowledge-grid">${filled.map((s) => `<div class="knowledge-block" id="kb-${s.id}"><div class="section-title"><h3>${esc(s.name)}</h3>${canEdit() ? `<button aria-label="Edit ${s.name}" class="text-button" data-a="${reg(() => editClient(c, s.id))}">Edit</button>` : ""}</div>${s.fields.map((f) => `<div class="knowledge-field"><span>${esc(f.label)}${c.internalFields.includes(f.key) ? ic("lock", { size: 11 }) : ""}</span><p>${esc(c.fields[f.key])}</p></div>`).join("")}</div>`).join("")}</div>`;
  const gap = empty.length ? `<div class="kb-gap"><h3>Still to add</h3><div>${empty.map((s) => canEdit() ? `<button type="button" data-a="${reg(() => editClient(c, s.id))}">${esc(s.name)}</button>` : `<span>${esc(s.name)}</span>`).join("")}</div></div>` : "";
  return `${lead}${jump}${grid}${gap}`;
}
function chatOverview(c) {
  const summary = kbSummaryText(c);
  if (!summary) return `<p class="not-added">The overview appears here once the first facts are saved.</p>`;
  return `<p class="kb-chat-sum">${esc(summary)}</p>`;
}
function viewClient(c) {
  const ws = st.ws; if (det.forId !== c.id) { det.forId = c.id; det.tab = "overview"; }
  const n = score(c); const refs = ws.refs.filter((r) => r.clientId === c.id);
  const approved = ws.examples.filter((e) => e.clientId === c.id && e.verdict === "approved");
  let content = "";
  if (det.tab === "overview") content = `<div class="brand-overview"><section>${kbArticle(c)}</section>
    <aside><div class="panel brand-sidecard"><h3>Brand palette</h3><div class="colour-swatches">${(c.fields.colours || c.colour).split(",").map((x) => x.trim()).filter((x) => /^#[a-f\d]{6}$/i.test(x)).map((x) => `<button data-a="${reg(() => copyText(x))}"><span style="background: ${x};"></span><small>${x}</small></button>`).join("")}</div><p>Click a colour to copy its hex code.</p></div>
    <div class="panel brand-sidecard"><h3>${ic("book-open", { size: 17 })}Caption examples</h3><b class="side-number">${approved.length}</b><p>approved examples for this brand</p>${approved.slice(0, 1).map((e) => `<blockquote>${esc(e.text)}</blockquote>`).join("")}</div>
    ${st.me?.canEdit ? `<div class="panel brand-sidecard internal-card"><h3>${ic("lock", { size: 16 })}Internal notes</h3><p>${esc(c.fields.internalNotes || "No internal notes yet.")}</p><small>Excluded from all writing context</small><button class="text-button" data-a="${reg(() => editClient(c, "internal"))}">Edit notes</button></div>` : ""}
    ${st.me?.isAdmin ? `<div class="client-danger">${btn(ic("archive") + (c.status === "archived" ? "Restore client" : "Archive client"), { variant: "ghost", cls: "archive-button", a: reg(() => confirmArchive(c)) })}${btn(ic("trash") + "Delete client", { variant: "ghost", cls: "archive-button delete-client", a: reg(() => confirmDelete(c)) })}</div>` : ""}</aside></div>`;
  else if (det.tab === "references") content = viewRefs(c, refs);
  else if (det.tab === "documents") content = viewDocuments(c);
  else if (det.tab === "notes") content = viewNotes(c);
  else if (det.tab === "assets") content = viewAssets(c);
  else { const json = det.ctx && det.ctxKey === c.id + det.platform + det.language ? JSON.stringify(det.ctx, null, 2) : null;
    if (json === null) loadContext(c);
    content = `<div class="bundle-head"><div><h2>What the bot can see</h2><p>Internal notes, locked fields and team-only documents are left out. This is exactly the context used for captions.</p></div><div class="inline-options">${select(det.platform, PLATFORMS, (v) => { det.platform = v; det.ctx = null; renderShell(); }, { label: "Context platform" })}${select(det.language, LANGUAGES, (v) => { det.language = v; det.ctx = null; renderShell(); }, { label: "Context language" })}${btn(ic("copy") + "Copy JSON", { variant: "outline", disabled: !json, a: reg(() => copyText(json)) })}</div></div><pre class="bundle-json">${json === null ? "Loading the writing context…" : esc(json)}</pre>`; }
  return `<button class="back-button" data-a="${reg(() => go("clients"))}">${ic("chevron-left", { size: 15 })}Client library</button>
  <div class="client-detail-head">${mark(c, "large")}<div><div class="detail-name"><h1>${esc(c.name)}</h1>${pill(c.status === "archived" ? "Archived" : n >= 80 ? "Complete" : "In progress", n >= 80 ? "ready" : "draft")}</div><p>${esc(c.industry)} <span>·</span> ${esc(c.location || "Location not added")}</p></div><div class="head-actions">${canEdit() ? btn(ic("file-text") + "Edit brand", { variant: "outline", a: reg(() => editClient(c)) }) : ""}${btn(ic("braces") + "Preview bot bundle", { a: reg(() => { det.tab = "bundle"; renderShell(); }) })}</div></div>
  <div class="client-meta"><span><span class="avatar tiny">${esc((c.lead || "?")[0])}</span>${esc(c.lead || "Unassigned")} · Account lead</span><span>${ic("clock-3", { size: 14 })}Updated ${dm(c.updatedAt)}</span><span class="detail-progress">Brand knowledge ${progress(n)}<b>${n}%</b></span></div>${libraryBars(c)}
  ${suggestionBox(c)}
  ${tabs(det.tab, [["overview", "Brand overview"], ["references", `Reference images <span class="tab-count">${refs.length}</span>`], ["documents", "Documents"], ["notes", "Team Notes"], ["assets", "Brand Assets"], ["bundle", `Writing context ${ic("braces", { size: 15 })}`]], (v) => { det.tab = v; renderShell(); }, { cls: "detail-tabs", content })}`;
}
function confirmArchive(c) {
  let busy = false;
  openDialog(() => `${alertHeader(`${c.status === "archived" ? "Restore" : "Archive"} ${esc(c.name)}?`, c.status === "archived" ? "The brand will be available in the active client library again." : "Brand details and examples are kept. The client will be excluded from caption detection.")}${alertFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog), disabled: busy }) + btn(busy ? "Saving…" : c.status === "archived" ? "Restore client" : "Archive client", { disabled: busy, a: reg(async () => { busy = true; st.dialog.locked = true; renderDialog();
    try { await act({ action: "client.save", client: { ...c, status: c.status === "archived" ? "active" : "archived" } }); await load(); st.dialog.locked = false; closeDialog(); toast.success("Client status updated"); renderShell(); }
    catch (e) { toast.error(e.message); busy = false; if (st.dialog) { st.dialog.locked = false; renderDialog(); } } }) }))}`, { alert: true });
}
function confirmDelete(c) {
  const f = { typed: "", busy: false, error: "" };
  const refs = (st.ws?.refs || []).filter((r) => r.clientId === c.id).length;
  const examples = (st.ws?.examples || []).filter((e) => e.clientId === c.id).length;
  const matches = () => f.typed.trim().toLowerCase() === c.name.trim().toLowerCase();
  const toggle = () => { const b = $("#delete-go"); if (b) b.disabled = f.busy || !matches(); };
  openDialog(() => `${alertHeader(`Delete ${esc(c.name)}?`, "This cannot be undone. If you only want to hide the client, archive it instead.")}
  <div class="delete-list"><p>This removes, for good:</p><ul><li>All brand knowledge and internal notes</li><li>${examples} caption ${examples === 1 ? "example" : "examples"}</li><li>${refs} reference ${refs === 1 ? "image" : "images"} and every document</li></ul><p>Bots will stop seeing this client straight away.</p></div>
  <div class="form-field"><label for="delete-confirm">Type <b>${esc(c.name)}</b> to confirm</label>${input({ id: "delete-confirm", value: f.typed, placeholder: c.name, inp: reg((v) => { f.typed = v; toggle(); }), attrs: 'autocomplete="off"' + (f.busy ? " disabled" : "") })}</div>
  ${f.error ? `<p class="error-text" role="alert">${esc(f.error)}</p>` : ""}
  ${alertFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog), disabled: f.busy }) + btn(f.busy ? "Deleting…" : "Delete client", { cls: "btn-danger", disabled: f.busy || !matches(), attrs: 'id="delete-go"', a: reg(async () => {
    if (!matches() || f.busy) return;
    f.busy = true; f.error = ""; st.dialog.locked = true; renderDialog();
    try {
      await api(`/br/clients/${encodeURIComponent(c.id)}/delete`, { confirm: f.typed.trim() });
      await load(); st.dialog.locked = false; closeDialog(); toast.success(`${c.name} was deleted`); go("clients");
    } catch (e) { f.error = e.message; f.busy = false; if (st.dialog) { st.dialog.locked = false; renderDialog(); } }
  }) }))}`, { alert: true });
}
function viewRefs(c, refs) {
  const R = refsState; afterHooks.push(() => { const f = $("#ref-file"); if (f) f.onchange = () => { const x = f.files?.[0]; if (x && x.size > 2e7) { R.error = "Please choose an image under 20 MB."; renderShell(); return; } R.file = x || null; R.error = ""; renderShell(); }; });
  return `<div class="bundle-head"><div><h2>Give the team a visual reference.</h2><p>Logos, products, packaging and places that make this brand recognisable.</p></div>${pill(`${refs.length} images`)}</div>
  <div class="reference-layout">${canEdit() ? `<form class="reference-upload panel" data-sub="${reg(() => saveRef(c))}"><label class="dropzone">${ic("upload", { size: 26 })}<b>${esc(R.file ? R.file.name : "Choose a reference image")}</b><span>JPG, PNG or WebP · resized to 1024px</span><input type="file" id="ref-file" accept="image/jpeg,image/png,image/webp" aria-label="Reference image"></label>
  <div class="form-field"><label>Reference type</label>${select(R.kind, REF_KINDS, (v) => { R.kind = v; renderShell(); }, { label: "Reference type" })}</div><div class="form-field"><label>Verdict</label>${select(R.verdict, [{ value: "", label: "Not a do or don't" }, { value: "do", label: "Do — copy this" }, { value: "dont", label: "Don't — avoid this" }], (v) => { R.verdict = v; renderShell(); }, { label: "Verdict" })}</div><div class="form-field"><label for="ref-why">Why</label>${input({ id: "ref-why", value: R.why, placeholder: "Logo too small, client rejected", inp: reg((v) => (R.why = v)) })}</div><div class="form-field"><label for="ref-drive">OneDrive link for the full video or post</label>${input({ id: "ref-drive", value: R.onedrive, placeholder: "https://…", inp: reg((v) => (R.onedrive = v)) })}</div><div class="form-field"><label for="ref-description">Description or visible text</label>${textarea({ id: "ref-description", value: R.description, placeholder: "Primary logo on a light background…", inp: reg((v) => (R.description = v)) })}</div>${R.error ? `<p class="error-text">${esc(R.error)}</p>` : ""}${btn((R.busy ? spin() : ic("upload")) + "Save reference", { type: "submit", disabled: !R.file || R.busy })}</form>` : ""}
  <div class="reference-grid">${refs.length ? refs.map((r) => `<div class="reference-card panel"><a href="${refUrl(r.id)}" target="_blank" rel="noreferrer"><img src="${refUrl(r.id)}" alt="${esc(r.description || r.name)}"></a><div>${pill(esc(r.kind))}${r.verdict ? pill(r.verdict === "do" ? "Do" : "Don't", r.verdict === "do" ? "ready" : "rejected") : ""}<h3>${esc(r.name)}</h3><p>${esc(r.description || "No description added.")}</p>${r.why ? `<p>${esc(r.why)}</p>` : ""}${r.onedriveUrl ? `<a href="${esc(r.onedriveUrl)}" target="_blank" rel="noreferrer">Open in OneDrive</a>` : ""}</div></div>`).join("") : empty("image", "A picture gives a little more context.", "Upload the first reference for this brand. Images stay in this private workspace.")}</div></div>`;
}
async function shrink(file, max = 1024, limit = 2097152) {
  const bmp = await createImageBitmap(file); const k = Math.min(1, max / Math.max(bmp.width, bmp.height)); const cv = document.createElement("canvas");
  cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k); const g = cv.getContext("2d"); if (!g) throw new Error("Your browser could not prepare this image.");
  g.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close?.();
  const type = file.type === "image/png" ? "image/png" : "image/webp"; const blob = await new Promise((r) => cv.toBlob(r, type, 0.86));
  if (!blob) throw new Error("Please try another image."); if (blob.size > limit) throw new Error("This image is still larger than 2 MB. Please use a smaller image.");
  return { mime: blob.type, data: await blobB64(blob) };
}
const blobB64 = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
async function saveRef(c) {
  const R = refsState; if (!R.file) return; R.busy = true; R.error = ""; renderShell();
  try { const im = await shrink(R.file); await api("/br/media", { clientId: c.id, kind: R.kind, description: R.description, verdict: R.verdict, why: R.why, onedriveUrl: R.onedrive, platform: R.platform, name: R.file.name, ...im }); await load(); R.file = null; R.description = ""; R.why = ""; R.onedrive = ""; R.verdict = ""; toast.success("Reference image saved"); }
  catch (e) { R.error = e.message; } finally { R.busy = false; renderShell(); }
}

/* ================= Editor ================= */
const INTERVIEW = [
  { section: "basics", key: "about", topic: "The business", ask: "In one line, what should a caption say this business does, and in which city?", why: "The team and the bots start from this line.", example: "A Kottakkal learning studio that teaches practical digital skills." },
  { section: "audience", key: "audience", topic: "The customer", ask: "Who in their city should the caption speak to?", why: "A caption should speak to a person, not to everyone.", example: "Students and job seekers in Malappuram who want skills they can use at work." },
  { section: "products", key: "products", topic: "What they offer", ask: "Which product or service should the next posts sell, and what price are we allowed to print?", why: "Prices on a creative have to match what the client has approved.", example: "Digital marketing course. Confirm the current fee before publishing it." },
  { section: "products", key: "usps", topic: "What to remember", ask: "What one difference should every caption repeat?", why: "This is the difference we are allowed to repeat.", example: "Hands-on projects, not theory-only classes." },
  { section: "voice", key: "tone", topic: "How they sound", ask: "Should the caption sound formal, friendly, or local Manglish?", why: "Every caption should be recognisable as theirs.", example: "Friendly, practical and confident. Never pushy." },
  { section: "languages", key: "primaryLanguage", topic: "Language", ask: "What language should the caption be in: English, Malayalam, or Manglish?", why: "English, Malayalam, Manglish, or a mix. Say which one is the default.", example: "English, with Malayalam when the post is for a local audience.", short: true },
  { section: "languages", key: "languageNotes", topic: "When to switch", ask: "When should we switch language?", why: "The same brand can use a different language on a different platform.", example: "English on LinkedIn. Conversational Manglish on Instagram." },
  { section: "words", key: "wordsAvoid", topic: "Never say", ask: "Which words or claims must never be used?", why: "A banned claim in a caption is a problem for the client.", example: "Guaranteed job. Guaranteed salary. No.1." },
  { section: "recognition", key: "phones", topic: "How to reach them", ask: "What phone number, website and social handles are printed on their posts?", why: "Quality Check uses these to recognise the brand.", example: "+91 98470 00000, level8.in, Instagram: level8" },
  { section: "recognition", key: "colours", topic: "Colours", ask: "Which brand colours must the creative use?", why: "A creative in the wrong colours is easy to reject.", example: "Navy #0A3D62 and white." },
  { section: "recognition", key: "fonts", topic: "Fonts", ask: "Which fonts must the creative use?", why: "Quality Check compares the creative with the brand fonts.", example: "Heading: the font in the brand guide.", short: true },
  { section: "recognition", key: "logoRules", topic: "Logo", ask: "Where should the logo sit on a post, and what must we never do with it?", why: "Quality Check looks at logo placement.", example: "Top left, on a light background. Never stretch it." },
  { section: "social", key: "hashtags", topic: "Hashtags", ask: "Which hashtags should a caption use?", why: "These are the tags the client has approved.", example: "#Level8 #DigitalSkills", short: true },
  { section: "social", key: "cta", topic: "The ending", ask: "What should the caption ask the reader to do: call, WhatsApp, book, or visit?", why: "The ending should be the same kind of next step each time.", example: "WhatsApp the clinic to book.", short: true },
  { section: "compliance", key: "disclaimer", topic: "Disclaimer", ask: "What disclaimer must appear on a caption or an ad, word for word?", why: "Quality Check looks for this line.", example: "Results vary. This is not a medical guarantee.", short: true },
  { section: "contacts", key: "contacts", topic: "Who approves", ask: "Who approves the work, and how fast do they usually reply?", why: "The team needs a person to ask, before anything goes live.", example: "The client representative, usually within one working day." },
  { section: "platforms", key: "platforms", topic: "Where they post", ask: "Which platforms do they use, and how often do they post?", why: "The voice stays the same. The format changes.", example: "Instagram and LinkedIn, a few times a week." },
  { section: "offers", key: "offers", topic: "A current offer", ask: "Is there a current offer? What is the price, and when does it end?", why: "An expired price must not appear on a creative.", example: "No active offer. If there is one, write the price and the last date." },
  { section: "ads", key: "adBudgets", topic: "Ads", ask: "Do they run ads? If yes, what budget, area and goal were agreed?", why: "Store the target only. Never an ads login or password.", example: "Meta leads in Kochi. Budget as agreed with the client." },
  { section: "seo", key: "seoKeywords", topic: "Search phrases", ask: "Which search phrases should the site be found for?", why: "This is the starting list. Live rankings stay in SEO Studio.", example: "digital marketing course kochi" },
  { section: "messages", key: "tagline", topic: "The line", ask: "What line should people remember?", why: "This is the approved tagline.", example: "Learn today. Lead tomorrow.", short: true },
  { section: "voice", key: "dos", topic: "Always do", ask: "What should we always do when we write for them?", why: "These are the writing habits to keep.", example: "Lead with a practical benefit. Use simple words." },
  { section: "compliance", key: "compliance", topic: "Claims", ask: "What claims need proof before we publish?", why: "Unproven claims should not reach a caption.", example: "No job, salary, or ranking claims unless the client has confirmed them." },
  { section: "seasonal", key: "seasonal", topic: "Seasons", ask: "Which festivals or seasons matter to them?", why: "The team needs the dates and how early to start.", example: "Onam: start three weeks ahead. Confirm the date with the client." },
  { section: "competitors", key: "competitors", topic: "Competitors", ask: "Who do they compete with? These notes stay inside the team.", why: "Competitor notes are never sent to a bot.", example: "Do not name competitors in captions." },
  { section: "internal", key: "internalNotes", topic: "Private notes", ask: "Anything the team should know that the bots must never see?", why: "This stays inside the team. It is never sent to a bot.", example: "Confirm every fee with the client before it is published." },
];
const FOLLOW = [
  { key: "audience", when: /student|learner|job|graduate|customer|patient|buyer|parent|audience/i, ask: (s) => `You mentioned “${s}”. Who is the main customer, and what do they need?` },
  { key: "products", when: /course|class|service|product|sell|training|treatment/i, ask: (s) => `You mentioned “${s}”. What do they sell or offer, and what does it cost?` },
  { key: "offers", when: /price|fee|₹|rs\.?\s?\d|discount|%|offer|cost/i, ask: () => "You mentioned a price or an offer. What is the current offer, and when does it end?" },
  { key: "usps", when: /known for|different|hands-on|practical|unlike|better/i, ask: (s) => `You mentioned “${s}”. What should people remember them for?` },
  { key: "tone", when: /friendly|professional|warm|tone|sound|confident|formal/i, ask: () => "How should this brand sound?" },
  { key: "primaryLanguage", when: /malayalam|english|manglish|language|hindi/i, ask: () => "You mentioned a language. Which language should we write in?" },
  { key: "languageNotes", when: /malayalam|english|manglish|linkedin|instagram/i, ask: () => "When should we switch language?" },
  { key: "wordsAvoid", when: /never|guaranteed|avoid|claim|do not say|don't say/i, ask: () => "Which words or claims must never be used?" },
  { key: "platforms", when: /instagram|facebook|linkedin|youtube|reel|whatsapp|tiktok/i, ask: () => "You mentioned a platform. Which platforms do they use, and how often do they post?" },
  { key: "hashtags", when: /#\w+|hashtag/i, ask: () => "Which hashtags should a caption use?" },
  { key: "cta", when: /sign up|enquire|enroll|book|explore|whatsapp|call now/i, ask: () => "What should a caption ask the reader to do?" },
  { key: "contacts", when: /approv|sign-?off|client will|manager/i, ask: () => "Who approves the work, and how fast do they usually reply?" },
  { key: "phones", when: /phone|\+91|website|www\.|handle|@/i, ask: () => "What phone number, website and social handles are printed on their posts?" },
  { key: "colours", when: /colour|color|font|logo|navy|#[0-9a-f]{3,6}/i, ask: () => "What colours and fonts should we use?" },
  { key: "adBudgets", when: /\bads?\b|meta ads|google ads|campaign|budget/i, ask: () => "You mentioned ads. What budget, area and goal were agreed?" },
  { key: "seoKeywords", when: /\bseo\b|google|keyword|search phrase|rank/i, ask: () => "Which search phrases should the site be found for?" },
  { key: "seasonal", when: /onam|christmas|eid|diwali|festival|new year|vishu|ramadan/i, ask: () => "You mentioned a season or festival. Which ones matter, and how early should we plan?" },
  { key: "compliance", when: /guaranteed|claim|medical|legal|proof|ranking/i, ask: () => "What claims need proof before we publish?" },
  { key: "tagline", when: /tagline|slogan|learn today|line they use/i, ask: () => "What line should people remember?" },
  { key: "competitors", when: /competitor|rival|other brand|other clinic/i, ask: () => "Who do they compete with? These notes stay inside the team." },
];
function clipAnswer(answer) {
  const s = String(answer || "").replace(/\s+/g, " ").trim();
  const cut = (s.split(/[.!?]/)[0] || s).trim();
  return cut.length > 80 ? cut.slice(0, 80).replace(/\s+\S*$/, "") : cut;
}
function pickNext(client, asked, answer, fresh) {
  const open = editorQuestions().filter((q) => !asked.has(q.key) && !String(client.fields[q.key] || "").trim());
  const snip = clipAnswer(answer);
  if (answer) {
    const hit = FOLLOW.find((f) => f.when.test(answer) && open.some((q) => q.key === f.key));
    if (hit) { const q = open.find((item) => item.key === hit.key); return { ...q, ask: hit.ask(snip) }; }
  }
  if (!open[0]) return null;
  return fresh || !snip ? open[0] : { ...open[0], ask: `Got that. ${open[0].ask}` };
}
function buildChat(client) {
  const qs = editorQuestions();
  const messages = [{ role: "bot", text: `I'll learn ${client.name} in this chat. Answer in your own words. The next question follows what you just said, until the brand knowledge is covered.` }];
  const asked = new Set();
  let last = "";
  for (const q of qs) {
    const value = String(client.fields[q.key] || "").trim();
    if (!value) continue;
    messages.push({ role: "bot", text: q.ask, key: q.key });
    messages.push({ role: "user", text: value, key: q.key });
    asked.add(q.key);
    last = value;
  }
  const next = pickNext(client, asked, last, true);
  if (next) messages.push({ role: "bot", text: next.ask, key: next.key });
  else messages.push({ role: "bot", text: `That covers the brand knowledge for ${client.name}.` });
  return { messages, pending: next, index: next ? qs.findIndex((q) => q.key === next.key) : 0 };
}
const FOUND_ORDER = ["about", "tagline", "products", "offers", "audience", "personas", "usps", "messages", "tone", "adjectives", "wordsUse", "primaryLanguage", "cta", "phones", "handles", "address", "platforms", "colours", "fonts", "logoRules", "keywords", "aliases", "seasonal", "seoKeywords", "hashtags", "compliance", "disclaimer", "bannedClaims"];
const FOUND_LABEL = { about: "What they do", tagline: "Their line", phones: "Phone numbers", handles: "Social accounts", address: "Address", platforms: "Where they post", colours: "Brand colour", audience: "The customer", products: "What they offer", usps: "What to remember", tone: "How they sound", seasonal: "Seasons", seoKeywords: "Search phrases" };
const YES = /^(y|yes|yeah|yep|ok|okay|correct|right|true|that'?s right|looks good|haan|athe|sheri)\b/i;
const NO = /^(n|no|nope|wrong|not right|skip|incorrect)\b\.?$/i;
function confirmQuestion(f) {
  const label = FOUND_LABEL[f.key] || f.key;
  const q = INTERVIEW.find((x) => x.key === f.key);
  const ask = `From the website. ${label}:\n${f.value}\n\nIs this right? Reply “yes”, or type the correct version.`;
  return { key: f.key, topic: q?.topic || label, ask, suggest: f.value, section: SECTIONS.find((s) => s.id === q?.section) || SECTIONS[0], short: false, label };
}
const handover = (prev, next) => (prev?.suggest && next && !next.suggest ? { ...next, ask: `That's everything from the website. Now the things it didn't say.\n\n${next.ask}` } : next);
function nextConfirm(a) {
  while (ed.queue.length) {
    const f = ed.queue.shift();
    if (!String(a.fields[f.key] || "").trim()) return confirmQuestion(f);
  }
  return null;
}
function openIntake(c, render = true) {
  const a = ed.draft || c;
  ed.intake = { name: a.name || "", website: a.fields.website || "", instagram: (String(a.fields.handles || "").match(/instagram:\s*@?([\w.]+)/i) || [])[1] || "", busy: false, error: "" };
  ed.messages = (ed.messages || []).filter((m) => m.role !== "intake");
  ed.messages.push({ role: "bot", text: `Let's start with the business name, the website and the Instagram handle. You can also upload a brochure or another document. I'll read those first, then ask only what the team still needs for captions and quality checks.` });
  ed.messages.push({ role: "intake" });
  ed.pending = null;
  if (render) renderShell();
}
function intakeReady(I) { return !!(I && I.name.trim() && (I.website.trim() || (I.files || []).length)); }
function intakeBubble() {
  const I = ed.intake; if (!I) return "";
  const toggle = () => { const b = document.getElementById("intake-read"); if (b) b.disabled = I.busy || !intakeReady(I); };
  const fileNames = (I.files || []).map((f) => f.name).join(", ");
  const label = (I.files || []).length && I.website.trim() ? "Read website and documents" : (I.files || []).length ? "Read documents" : "Read website";
  afterHooks.push(() => {
    const f = document.getElementById("intake-file");
    if (!f || !ed.intake) return;
    f.onchange = () => {
      const chosen = [...f.files].slice(0, 2);
      const bad = chosen.find((x) => x.size > 3e6 || !/\.(pdf|txt|md|csv)$/i.test(x.name));
      if (bad) { ed.intake.error = bad.size > 3e6 ? "Each file needs to be under 3 MB." : "Use a PDF, text, Markdown or CSV file."; ed.intake.files = []; renderShell(); return; }
      ed.intake.files = chosen; ed.intake.error = ""; renderShell();
    };
  });
  return `<form class="chat-msg bot intake-card" data-sub="${reg(() => runIntake())}"><span class="chat-who">Brandroom</span>
  <div class="form-field"><label for="intake-name">Business name</label>${input({ id: "intake-name", value: I.name, placeholder: "e.g. White Stone Aligners", inp: reg((v) => { I.name = v; toggle(); }), attrs: 'maxlength="100"' + (I.busy ? " disabled" : "") })}</div>
  <div class="form-field"><label for="intake-site">Website</label>${input({ id: "intake-site", value: I.website, placeholder: "example.com", inp: reg((v) => { I.website = v; toggle(); }), attrs: 'inputmode="url" autocomplete="url"' + (I.busy ? " disabled" : "") })}</div>
  <div class="form-field"><label for="intake-ig">Instagram</label>${input({ id: "intake-ig", value: I.instagram, placeholder: "@handle", inp: reg((v) => { I.instagram = v; }), attrs: I.busy ? "disabled" : "" })}</div>
  <div class="form-field"><label for="intake-file">Brochure or other document</label><input id="intake-file" type="file" accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/csv,text/markdown" multiple ${I.busy ? "disabled" : ""}><small>${fileNames ? esc(fileNames) : "PDF, text or CSV. Up to 2 files."}</small></div>
  ${I.error ? `<p class="error-text" role="alert">${esc(I.error)}</p>` : ""}
  <div class="intake-actions">${btn("Skip, just ask me", { variant: "ghost", disabled: I.busy, a: reg(() => skipIntake()) })}${btn((I.busy ? spin(15) + "Reading…" : ic("globe", { size: 15 }) + label), { type: "submit", disabled: I.busy || !intakeReady(I), attrs: 'id="intake-read"' })}</div></form>`;
}
function fieldLabel(key) {
  return FOUND_LABEL[key] || SECTIONS.flatMap((s) => s.fields).find((f) => f.key === key)?.label || INTERVIEW.find((q) => q.key === key)?.topic || key;
}
function reviewBubble() {
  const R = ed.review; if (!R) return "";
  const on = R.items.filter((i) => i.on && i.value.trim()).length;
  const rows = R.items.map((it, n) => `<div class="review-item${it.on ? "" : " off"}">
    <label class="review-head"><input type="checkbox"${it.on ? " checked" : ""}${R.busy ? " disabled" : ""} data-in="${reg((v, el) => { it.on = el.checked; renderShell(); })}"><b>${esc(it.label)}</b>${it.confidence === "low" ? `<span class="review-guess">best guess</span>` : ""}</label>
    ${textarea({ id: "review-" + n, value: it.value, rows: Math.min(6, Math.max(1, it.value.split("\n").length, Math.ceil(it.value.length / 70))), inp: reg((v) => { it.value = v; }), attrs: it.on && !R.busy ? "" : "disabled" })}
  </div>`).join("");
  return `<div class="chat-msg bot review-card"><span class="chat-who">From ${esc(R.site)}</span>${rows}
  <div class="intake-actions">${btn("Discard all", { variant: "ghost", disabled: R.busy, a: reg(() => saveReview(false)) })}${btn(R.busy ? spin(15) + "Saving…" : ic("check", { size: 15 }) + `Save ${on} ${on === 1 ? "detail" : "details"}`, { disabled: R.busy, a: reg(() => saveReview(true)) })}</div></div>`;
}
async function saveReview(keep) {
  const R = ed.review, a = ed.draft; if (!R || R.busy || !a) return;
  const chosen = keep ? R.items.filter((i) => i.on && i.value.trim()) : [];
  for (const it of chosen) a.fields[it.key] = it.value.trim();
  R.busy = true; renderShell();
  ed.messages = ed.messages.filter((m) => m.role !== "review");
  ed.review = null;
  ed.messages.push({ role: "user", text: chosen.length ? `Saved ${chosen.length} ${chosen.length === 1 ? "detail" : "details"} from the website.` : "Discard the website details." });
  const asked = new Set(ed.messages.filter((m) => m.role === "user" && m.key).map((m) => m.key));
  let next = pickNext(a, asked, "", true);
  if (next && st.cfg?.ai) {
    ed.thinking = true; renderShell();
    const found = chosen.slice(0, 6).map((it) => `${it.label}: ${it.value.replace(/\s+/g, " ").slice(0, 140)}`).join("; ");
    next = await aiAsk(a, next, found, asked, chosen[0]?.key || "");
    ed.thinking = false;
  }
  ed.pending = next;
  ed.qi = next ? Math.max(0, editorQuestions().findIndex((q) => q.key === next.key)) : ed.qi;
  ed.messages.push({ role: "bot", text: next ? `${chosen.length ? "Saved. Now what we still need for captions and quality checks.\n\n" : ""}${next.ask}` : `That covers the brand knowledge for ${a.name}.`, key: next?.key });
  ed.focusQ = true;
  if (!chosen.length) { renderShell(); return; }
  ed.saving = true; renderShell();
  try { const s = await act({ action: "client.save", client: a }); await load(); ed.draft = JSON.parse(JSON.stringify(s.client)); ed.dirty = false; }
  catch (e) { ed.error = e.message; ed.dirty = true; }
  finally { ed.saving = false; renderShell(); }
}
async function aiAsk(a, q, last, asked, answered) {
  if (!st.cfg?.ai || !q || q.suggest) return q;
  const known = {};
  for (const [k, v] of Object.entries(a.fields || {})) if (String(v || "").trim() && !/internal|competitor|locked/i.test(k)) known[k] = String(v).slice(0, 400);
  const open = editorQuestions().filter((x) => !asked.has(x.key) && !String(a.fields[x.key] || "").trim()).map((x) => ({ field: x.key, ask: x.ask }));
  try {
    const r = await api("/br/onboarding", { action: "ask", open, answered: answered || "", last: last || "", name: a.name, businessType: a.fields?.businessType || "", known });
    const match = r.ai && editorQuestions().find((x) => x.key === r.field);
    return match && !asked.has(match.key) ? { ...match, ask: r.ask } : q;
  } catch { return q; }
}
function startQuestions(a, lead) {
  const asked = new Set(ed.messages.filter((m) => m.role === "user" && m.key).map((m) => m.key));
  const next = nextConfirm(a) || pickNext(a, asked, "", true);
  ed.pending = next;
  ed.qi = next ? Math.max(0, editorQuestions().findIndex((q) => q.key === next.key)) : ed.qi;
  if (lead) ed.messages.push({ role: "bot", text: lead });
  ed.messages.push({ role: "bot", text: next ? next.ask : `That covers the brand knowledge for ${a.name}.`, key: next?.key });
  ed.focusQ = true;
}
function skipIntake() {
  const a = ed.draft; ed.intake = null;
  ed.messages = ed.messages.filter((m) => m.role !== "intake");
  startQuestions(a, "");
  renderShell();
}
async function runIntake() {
  const I = ed.intake, a = ed.draft; if (!I || I.busy || !a) return;
  I.busy = true; I.error = ""; renderShell();
  let r;
  let extraText = "";
  try {
    for (const file of I.files || []) {
      const mime = /\.pdf$/i.test(file.name) ? "application/pdf" : /\.csv$/i.test(file.name) ? "text/csv" : /\.md$/i.test(file.name) ? "text/markdown" : "text/plain";
      const up = await api("/br/documents", { clientId: a.id, name: file.name, mime, data: await blobB64(file) });
      const text = up.document?.id ? await api(`/br/documents/${up.document.id}/text`).catch(() => ({ text: "" })) : { text: "" };
      if (text.text) extraText += `\n\n${file.name}\n${String(text.text).slice(0, 8000)}`;
      else I.error = (I.error ? I.error + " " : "") + `${file.name} was saved, but no text could be read from it.`;
    }
    r = await api("/br/onboarding", { action: "scan", businessName: I.name.trim(), website: I.website.trim(), instagram: I.instagram.trim(), extraText });
  }
  catch (e) { I.busy = false; I.error = e.message + " Check the address, or skip and answer the questions."; renderShell(); return; }
  ed.messages = ed.messages.filter((m) => m.role !== "intake");
  ed.messages.push({ role: "user", text: [I.name.trim(), r.website, r.instagram ? "@" + r.instagram : ""].filter(Boolean).join("\n") });
  if (I.name.trim() && I.name.trim() !== a.name) a.name = I.name.trim();
  const hostOf = (v) => String(v || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
  if (r.website && hostOf(a.fields.website) !== hostOf(r.website)) a.fields.website = r.website;
  const hasHandles = String(a.fields.handles || "").trim();
  if (r.instagram && hasHandles && !new RegExp("instagram:\\s*@?" + r.instagram.replace(/\./g, "\\."), "i").test(hasHandles))
    a.fields.handles = `${hasHandles}\nInstagram: ${r.instagram}`;
  if (r.businessType && !String(a.fields.businessType || "").trim()) a.fields.businessType = r.businessType;
  const readFrom = [r.website ? r.site : "", (I.files || []).map((f) => f.name).join(", ")].filter(Boolean).join(" and ");
  const fresh = r.facts.filter((f) => !String(a.fields[f.key] || "").trim()).sort((x, y) => FOUND_ORDER.indexOf(x.key) - FOUND_ORDER.indexOf(y.key));
  ed.queue = fresh;
  ed.intake = null;
  if (fresh.length) {
    ed.queue = [];
    ed.review = { site: r.site, pages: r.pages, busy: false, items: fresh.map((f) => ({ key: f.key, label: fieldLabel(f.key), value: f.value, confidence: f.confidence, on: true })) };
    ed.messages.push({ role: "bot", text: `I read ${readFrom} and filled in ${fresh.length} ${fresh.length === 1 ? "detail" : "details"}. Check them below, fix anything that's off, untick anything wrong, then save. After that I'll only ask what we still need for captions and quality checks.` });
    ed.messages.push({ role: "review" });
    ed.pending = null;
  } else startQuestions(a, `I read ${r.site}, but it didn't say anything new I could use. Let's go through the questions.`);
  ed.saving = true; renderShell();
  try { const s = await act({ action: "client.save", client: a }); await load(); ed.draft = JSON.parse(JSON.stringify(s.client)); ed.dirty = false; }
  catch (e) { ed.error = e.message; ed.dirty = true; }
  finally { ed.saving = false; renderShell(); }
}
function editorQuestions() {
  return INTERVIEW.filter((q) => canEdit() || (q.section !== "internal" && q.section !== "competitors")).map((q) => ({
    ...q, section: SECTIONS.find((s) => s.id === q.section) || SECTIONS[0], top: false, short: !!q.short, label: q.topic,
  }));
}
function viewEditor(c) {
  if (ed.forId !== c.id || !ed.draft) { ed.forId = c.id; ed.draft = JSON.parse(JSON.stringify(c)); ed.dirty = false; ed.error = ""; ed.qi = null; ed.messages = null; ed.pending = null; ed.reply = ""; ed.intake = null; ed.queue = []; ed.review = null; ed.thinking = false; ed.aiOpened = false; ed.uploading = false; }
  const a = ed.draft;
  if (!ed.messages) {
    if (!String(a.fields.website || "").trim() && canEdit()) {
      ed.messages = [{ role: "bot", text: `I'll learn ${a.name} in this chat. Answer in your own words. The next question follows what you just said, until the brand knowledge is covered.` }];
      ed.qi = 0; openIntake(a, false);
    } else {
      const built = buildChat(a); ed.messages = built.messages; ed.pending = built.pending; ed.qi = built.index;
      if (st.cfg?.ai && ed.pending && !ed.aiOpened) {
        ed.aiOpened = true;
        const askedNow = new Set(ed.messages.filter((m) => m.role === "user" && m.key).map((m) => m.key));
        const last = [...ed.messages].reverse().find((m) => m.role === "user" && m.key);
        aiAsk(a, ed.pending, last?.text || "", askedNow, last?.key || "").then((q) => {
          if (!q?.ask || !ed.pending || (q.key === ed.pending.key && q.ask === ed.pending.ask)) return;
          if (ed.messages.at(-1)?.role === "bot") {
            ed.messages[ed.messages.length - 1] = { role: "bot", text: q.ask, key: q.key };
            ed.pending = q; ed.qi = Math.max(0, editorQuestions().findIndex((x) => x.key === q.key)); renderShell();
          }
        });
      }
    }
  }
  const asked = () => new Set(ed.messages.filter((m) => m.role === "user" && m.key).map((m) => m.key));
  const askTopic = (i) => {
    const q = editorQuestions()[i]; if (!q) return;
    if (ed.pending?.key === q.key && ed.messages.at(-1)?.role === "bot" && ed.messages.at(-1)?.key === q.key) return;
    const has = String(a.fields[q.key] || "").trim();
    const ask = has ? `Want to change this? ${q.ask}` : q.ask;
    ed.pending = { ...q, ask }; ed.qi = i; ed.messages.push({ role: "bot", text: ask, key: q.key }); ed.focusQ = true; renderShell();
  };
  const send = async (forced) => {
    const text = (typeof forced === "string" ? forced : ed.reply).trim();
    if (!text || !ed.pending || ed.saving || ed.thinking) return;
    const key = ed.pending.key;
    const suggest = ed.pending.suggest;
    const rejected = suggest && NO.test(text);
    const value = suggest && YES.test(text) ? suggest : text;
    ed.messages.push({ role: "user", text, key: rejected ? undefined : key });
    ed.reply = "";
    if (rejected) {
      const next = handover(ed.pending, nextConfirm(a) || pickNext(a, asked(), "", true));
      ed.pending = next;
      ed.qi = next ? Math.max(0, editorQuestions().findIndex((q) => q.key === next.key)) : ed.qi;
      ed.messages.push({ role: "bot", text: next ? `Left out. ${next.ask}` : "That covers the brand knowledge.", key: next?.key });
      ed.focusQ = true; renderShell(); return;
    }
    let saved = value;
    if (st.cfg?.ai && !suggest) {
      ed.thinking = "check"; renderShell();
      try {
        const known = {};
        for (const [k, v] of Object.entries(a.fields || {})) if (String(v || "").trim() && !/internal|competitor|locked/i.test(k)) known[k] = String(v).slice(0, 400);
        const learned = await api("/br/onboarding", { action: "learn", field: key, question: ed.pending.ask || "", answer: value, name: a.name, known });
        for (const u of learned.updates || []) if (u.field && u.value) a.fields[u.field] = u.value;
        saved = a.fields[key] || value;
        if (learned.note) ed.messages.push({ role: "bot", text: learned.note });
      } catch { a.fields[key] = value; }
      ed.thinking = false;
    } else a.fields[key] = value;
    let picked = nextConfirm(a) || (suggest ? pickNext(a, asked(), "", true) : pickNext(a, asked(), saved));
    if (picked && !picked.suggest && st.cfg?.ai) {
      ed.thinking = "next"; renderShell();
      picked = await aiAsk(a, picked, suggest ? "" : saved, asked(), suggest ? "" : key);
      ed.thinking = false;
    }
    const next = handover(ed.pending, picked);
    ed.pending = next;
    ed.qi = next ? Math.max(0, editorQuestions().findIndex((q) => q.key === next.key)) : ed.qi;
    ed.messages.push({ role: "bot", text: next ? next.ask : "That covers the brand knowledge. Your answers are saved.", key: next?.key });
    ed.saving = true; ed.focusQ = true; ed.error = ""; renderShell();
    try { const r = await act({ action: "client.save", client: a }); await load(); ed.draft = JSON.parse(JSON.stringify(r.client)); ed.dirty = false; }
    catch (e) { ed.error = e.message; ed.dirty = true; }
    finally { ed.saving = false; renderShell(); }
  };
  const skip = async () => {
    if (!ed.pending || ed.saving || ed.thinking) return;
    const key = ed.pending.key;
    ed.messages.push({ role: "user", text: "Skip this one.", key: ed.pending.suggest ? undefined : key });
    let picked = nextConfirm(a) || pickNext(a, asked(), "", true);
    if (picked && !picked.suggest && st.cfg?.ai) {
      ed.thinking = true; renderShell();
      const last = [...ed.messages].reverse().find((m) => m.role === "user" && m.key && !/^skip this one\.?$/i.test(m.text));
      picked = await aiAsk(a, picked, last?.text || "", asked(), last?.key || "");
      ed.thinking = false;
    }
    const next = handover(ed.pending, picked);
    ed.pending = next;
    ed.qi = next ? editorQuestions().findIndex((q) => q.key === next.key) : ed.qi;
    ed.messages.push({ role: "bot", text: next ? next.ask : "That covers the brand knowledge.", key: next?.key });
    ed.focusQ = true; renderShell();
  };
  const saveChatFile = async (file) => {
    if (!file || ed.uploading) return;
    ed.uploading = true; ed.error = ""; renderShell();
    try {
      const image = /^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
      if (image) {
        if (file.size > 2e7) throw new Error("Please choose an image under 20 MB.");
        const im = await shrink(file);
        const kind = /logo/i.test(file.name) ? "Logo" : /pack/i.test(file.name) ? "Packaging" : /product/i.test(file.name) ? "Product" : "Reference";
        await api("/br/media", { clientId: c.id, kind, name: file.name, description: `${kind} added from the brand chat.`, ...im });
        ed.messages.push({ role: "user", text: `Saved ${kind.toLowerCase()}: ${file.name}` });
      } else if (/\.(pdf|txt|md|csv)$/i.test(file.name)) {
        if (file.size > 3e6) throw new Error("Each document needs to be under 3 MB.");
        const mime = /\.pdf$/i.test(file.name) ? "application/pdf" : /\.csv$/i.test(file.name) ? "text/csv" : /\.md$/i.test(file.name) ? "text/markdown" : "text/plain";
        await api("/br/documents", { clientId: c.id, name: file.name, mime, data: await blobB64(file) });
        ed.messages.push({ role: "user", text: `Saved document: ${file.name}` });
      } else throw new Error("Use a JPG, PNG or WebP image, or a PDF, text or CSV file.");
      await load();
      toast.success(`${file.name} saved`);
    } catch (e) { ed.error = e.message; }
    finally { ed.uploading = false; renderShell(); }
  };
  afterHooks.push(() => {
    const log = document.getElementById("chat-log"); if (log) log.scrollTop = log.scrollHeight;
    const file = document.getElementById("chat-file");
    if (file) file.onchange = () => { const chosen = file.files?.[0]; file.value = ""; if (chosen) saveChatFile(chosen); };
    const box = document.getElementById("chat-reply");
    if (box) box.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); box.form?.requestSubmit(); } });
    if (ed.focusQ && box) { ed.focusQ = false; box.focus(); }
  });
  const log = ed.messages.map((m) => m.role === "intake" ? intakeBubble() : m.role === "review" ? reviewBubble() : `<div class="chat-msg ${m.role}"><span class="chat-who">${m.role === "bot" ? "Brandroom" : "You"}</span>${esc(m.text)}</div>`).join("")
    + (ed.intake?.busy ? `<div class="chat-msg bot"><span class="chat-who">Brandroom</span>${spin(14)} Reading the website. This takes a few seconds…</div>` : "")
    + (ed.thinking ? `<div class="chat-msg bot"><span class="chat-who">Brandroom</span>${spin(14)} ${ed.thinking === "check" ? "Checking the answer…" : "Thinking of the next question…"}</div>` : "")
    + (ed.uploading ? `<div class="chat-msg bot"><span class="chat-who">Brandroom</span>${spin(14)} Saving the file…</div>` : "");
  const quick = ed.pending?.suggest ? `<div class="chat-quick">${btn(ic("check", { size: 14 }) + "Yes, that's right", { size: "sm", variant: "outline", disabled: ed.saving, a: reg(() => send("yes")) })}${btn("No, leave it out", { size: "sm", variant: "ghost", disabled: ed.saving, a: reg(() => send("no")) })}</div>` : "";
  return `<button class="back-button" data-a="${reg(() => (ed.dirty ? confirmLeave(() => { ed.dirty = false; ed.draft = null; ed.messages = null; go("client", c.id); }) : go("client", c.id)))}">${ic("chevron-left", { size: 15 })}Back to ${esc(c.name)}</button>
  ${pageHead("BRAND INTERVIEW", `Get to know ${esc(c.name)}.`, "A chat. Each answer leads to the next relevant question, until the brand knowledge is covered.", editorBadge())}
  <div class="editor-layout"><nav class="section-stepper" id="ed-stepper">${stepper(a, ed.pending?.key, askTopic)}</nav>
  <section class="editor-main panel chat-panel"><div class="chat-overview"><div class="eyebrow">KNOWLEDGE BASE</div>${chatOverview(a)}</div><div id="chat-log" class="chat-log">${log}</div>
  ${ed.error ? `<p class="error-text" role="alert">${esc(ed.error)}</p>` : ""}
  ${ed.intake ? `<p class="hint">Fill in the details above, or skip and answer the questions.</p>` : ""}
  ${!ed.intake && canEdit() ? `<div class="chat-tools"><button type="button" class="text-button" data-a="${reg(() => openIntake(c))}">${ic("globe", { size: 14 })}${String(a.fields.website || "").trim() ? "Read the website again" : "Read a website"}</button><label class="text-button">${ic("upload", { size: 14 })}Add logo or file<input id="chat-file" type="file" accept="image/jpeg,image/png,image/webp,.pdf,.txt,.md,.csv,application/pdf,text/plain" ${ed.uploading ? "disabled" : ""}></label></div>` : ""}
  ${ed.intake ? "" : quick}
  ${ed.intake ? "" : ed.pending ? `<form class="chat-compose" data-sub="${reg(send)}">${textarea({ id: "chat-reply", value: ed.reply, rows: 2, placeholder: ed.pending.suggest ? "Type “yes”, or the correct version…" : "Type your answer…", inp: reg((v) => { ed.reply = v; const b = document.getElementById("chat-send"); if (b) b.disabled = ed.saving || !v.trim(); }) })}<div class="chat-actions">${btn("Skip", { variant: "ghost", a: reg(skip), disabled: ed.saving })}${btn(ed.saving ? "Saving…" : "Send", { type: "submit", disabled: ed.saving || !ed.reply.trim(), attrs: 'id="chat-send"' })}</div></form>` : `<p class="hint">The brand knowledge is covered. Choose a topic on the left to change an answer.</p>`}</section></div>`;
}
const editorBadge = () => `<span id="ed-state" class="pill ${ed.dirty ? "draft" : "ready"}">${ed.dirty ? "Unsaved changes" : ic("check", { size: 13 }) + "All changes saved"}</span>`;
function stepper(a, key, pick) {
  const n = score(a);
  const qs = editorQuestions();
  return `<div class="stepper-progress"><b>${n}% complete</b>${progress(n, { label: "Brand completeness" })}</div>${qs.map((q, i) => { const done = !!String(a.fields[q.key] || "").trim(); const locked = q.section.id === "internal" || q.section.id === "competitors"; return `<button type="button" class="${q.key === key ? "active" : ""}" data-a="${reg(() => pick(i))}"><span class="step-mark ${done ? "done" : ""}">${locked ? ic("lock", { size: 12 }) : done ? ic("check", { size: 13 }) : pad2(i + 1)}</span><span class="step-name">${esc(q.topic)}</span></button>`; }).join("")}`;
}
function updateStepper() { const el = $("#ed-stepper"); if (!el || !ed.draft) return; el.innerHTML = stepper(ed.draft, ed.pending?.key, (i) => { const q = editorQuestions()[i]; if (!q || (ed.pending?.key === q.key && ed.messages?.at(-1)?.key === q.key)) return; const has = String(ed.draft.fields[q.key] || "").trim(); const ask = has ? `Want to change this? ${q.ask}` : q.ask; ed.pending = { ...q, ask }; ed.qi = i; ed.messages.push({ role: "bot", text: ask, key: q.key }); ed.focusQ = true; renderShell(); }); }

/* ================= Examples ================= */
function viewExamples() {
  const ws = st.ws; const E = exs; const q = E.q.toLowerCase();
  const list = ws.examples.filter((e) => (E.client === "all" || e.clientId === E.client) && (E.tab === "All examples" || (E.tab === "Featured" && e.featured) || (E.tab === "Approved" && e.verdict === "approved") || (E.tab === "Rejected" && e.verdict === "rejected")) && e.text.toLowerCase().includes(q));
  afterHooks.push(() => { const i = $("#ex-q"); if (i) i.addEventListener("input", () => { E.q = i.value; const pos = i.selectionStart; renderShell(); const n = $("#ex-q"); n.focus(); n.setSelectionRange(pos, pos); }); });
  const add = canEdit() ? btn(ic("plus") + "Add example", { a: reg(openAddExample) }) : "";
  return `${pageHead("THE VOICES TO LEARN FROM", "Good examples. Clear direction.", "Keep the captions that work, and the lessons from those that don’t.", add)}
  <div class="examples-toolbar">${tabs(E.tab, ["All examples", "Approved", "Rejected", "Featured"].map((x) => [x, x]), (v) => { E.tab = v; renderShell(); })}<div class="inline-options"><div class="searchbox">${ic("search", { size: 16 })}${input({ id: "ex-q", value: E.q, placeholder: "Search caption text…", attrs: 'aria-label="Search examples"' })}</div>${select(E.client, [{ value: "all", label: "All clients" }, ...ws.clients.map((c) => ({ value: c.id, label: c.name }))], (v) => { E.client = v; renderShell(); }, { label: "Filter examples by client" })}</div></div>
  <div class="examples-grid">${list.map((n) => { const c = ws.clients.find((x) => x.id === n.clientId); return `<article class="example-card panel"><div class="example-head"><div class="table-brand">${c ? mark(c, "mini") : ""}<span><b>${esc(c?.name)}</b><small>${esc(n.platform)} · ${esc(n.language)}</small></span></div><button class="star-button ${n.featured ? "featured" : ""}" aria-label="${n.featured ? "Unfeature example" : "Feature example"}"${E.busy === n.id || !canEdit() ? " disabled" : ""} data-a="${reg(() => toggleFeatured(n))}">${ic("star", { size: 18, fill: n.featured ? "currentColor" : "none" })}</button></div>${pill((n.verdict === "approved" ? ic("check", { size: 12 }) : ic("x", { size: 12 })) + " " + (n.verdict === "approved" ? "Approved" : "Rejected"), n.verdict === "approved" ? "ready" : "rejected")}<p class="example-text">${esc(n.text)}</p>${n.reason ? `<div class="example-reason ${n.verdict}"><b>${n.verdict === "approved" ? "Why it works" : "Why it was rejected"}</b><p>${esc(n.reason)}</p></div>` : ""}<div class="example-footer"><small>${dm(n.createdAt)}</small>${btn(ic("copy") + "Copy caption", { variant: "ghost", size: "sm", a: reg(() => copyText(n.text)) })}</div></article>`; }).join("")}</div>
  ${list.length ? "" : empty("book-open", "No examples found", "Adjust the filters or add a caption to start the library.", canEdit() ? btn(ic("plus") + "Add example", { a: reg(openAddExample) }) : "")}`;
}
async function toggleFeatured(n) { exs.busy = n.id; renderShell(); try { await act({ action: "example.save", example: { ...n, featured: !n.featured } }); await load(); } catch (e) { toast.error(e.message); } finally { exs.busy = null; renderShell(); } }
function openAddExample() {
  const cs = st.ws.clients; const f = { client: (exs.client !== "all" && exs.client) || cs[0]?.id || "", platform: "Instagram", language: "English", verdict: "approved", text: "", reason: "", busy: false, error: "" };
  const okNow = () => !f.busy && f.text.trim() && f.client && !(f.verdict === "rejected" && !f.reason.trim());
  const upd = () => { const b = $("#ex-save"); if (b) b.disabled = !okNow(); };
  const render = () => `${dlgHeader("Add a caption example", "The reason is as useful as the caption itself.")}<form data-sub="${reg(submit)}"><div class="form-field"><label>Client</label>${select(f.client, cs.map((c) => ({ value: c.id, label: c.name })), (v) => { f.client = v; renderDialog(); }, { label: "Example client" })}</div>
  <div class="two-fields"><div class="form-field"><label>Platform</label>${select(f.platform, PLATFORMS, (v) => { f.platform = v; renderDialog(); }, { label: "Example platform" })}</div><div class="form-field"><label>Language</label>${select(f.language, LANGUAGES, (v) => { f.language = v; renderDialog(); }, { label: "Example language" })}</div></div>
  <div class="form-field"><label>Status</label>${select(f.verdict, [{ value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }], (v) => { f.verdict = v; renderDialog(); }, { label: "Example status" })}</div>
  <div class="form-field"><label for="ex-text">Caption</label>${textarea({ id: "ex-text", value: f.text, rows: 4, inp: reg((v) => { f.text = v; upd(); }), attrs: 'maxlength="5000" required' })}</div>
  <div class="form-field"><label for="ex-reason">${f.verdict === "rejected" ? "Why was this rejected? (required)" : "Why does this work?"}</label>${textarea({ id: "ex-reason", value: f.reason, rows: 2, inp: reg((v) => { f.reason = v; upd(); }), attrs: `maxlength="2000"${f.verdict === "rejected" ? " required" : ""}` })}</div>
  ${f.error ? `<p class="error-text">${esc(f.error)}</p>` : ""}${dlgFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog) }) + btn((f.busy ? spin() : ic("check")) + "Save example", { type: "submit", disabled: !okNow(), attrs: 'id="ex-save"' }))}</form>`;
  async function submit() { if (!okNow()) return; f.busy = true; f.error = ""; renderDialog();
    try { await act({ action: "example.save", example: { id: uuid(), clientId: f.client, platform: f.platform, language: f.language, verdict: f.verdict, text: f.text, reason: f.reason, featured: false } }); await load(); closeDialog(); toast.success("Caption example saved"); renderShell(); }
    catch (e) { f.error = e.message; f.busy = false; renderDialog(); } }
  openDialog(render, { cls: "example-dialog" });
}

/* ================= Activity ================= */
function viewActivity() {
  return `${pageHead("WORKSPACE", "Activity", "A record of changes to your brand knowledge.")}<div class="activity-page panel">${st.ws.activities.map((a) => `<div class="activity-item"><span class="activity-icon">${ic("clock-3", { size: 16 })}</span><div><b>${esc(a.text)}</b><p>${esc(a.actor || "Workspace admin")} · ${dm(a.createdAt)} · ${hm(a.createdAt)} IST</p></div></div>`).join("") || empty("clock-3", "Nothing yet", "Changes to brand knowledge will appear here.")}</div>`;
}

/* ================= People & roles (admin manages; everyone else just sees who is here) ================= */
const people = { users: null, loading: false, error: "" };
const ROLE_INFO = {
  admin: ["Admin", "Everything: clients, documents, people and settings."],
  head: ["Head", "Create and edit clients, documents, images and examples. Can see internal notes."],
  staff: ["Staff", "View brand knowledge only. Internal notes and team-only documents are hidden."],
};
const ago = (t) => { if (!t) return "Never"; const m = Math.round((Date.now() - new Date(t)) / 60000); return m < 2 ? "Just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : dm(t); };
const genPassword = () => { const a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const r = crypto.getRandomValues(new Uint32Array(14)); return [...r].map((n) => a[n % a.length]).join(""); };

async function loadPeople(force = false) {
  if (people.loading || (people.users && !force)) return;
  people.loading = true;
  try { people.users = (await api("/br/users")).users; people.error = ""; }
  catch (e) { people.error = e.message; }
  finally { people.loading = false; if (st.view === "settings" && sets.tab === "people") renderShell(); }
}

function viewPeople() {
  const ws = st.ws; const admin = st.me?.isAdmin;
  const legend = `<div class="role-legend">${Object.entries(ROLE_INFO).map(([k, [n, d]]) => `<div><b>${n}</b><span>${d}</span></div>`).join("")}</div>`;
  if (!admin) {
    return `<div class="notice people-notice">${ic("info", { size: 17 })}Only an admin can add or change people.</div>${legend}<div class="panel">${table([thc("Person"), thc("Access")].join(""), ws.team.map((p) => row([`<div class="table-brand"><span class="avatar">${esc(initials(p.name))}</span><b>${esc(p.name)}</b></div>`, pill(ROLE[p.role] || p.role)])).join(""))}</div>`;
  }
  if (!people.users) { loadPeople(); return people.error ? `<div class="notice people-notice">${ic("circle-alert", { size: 17 })}${esc(people.error)}</div>` : `<p class="hint">Loading people…</p>`; }
  const list = people.users;
  return `<div class="people-head"><p>${list.filter((u) => u.active).length} active · ${list.length} in total</p>${btn(ic("plus") + "Add person", { a: reg(() => openPersonDialog()) })}</div>${legend}
  <div class="panel">${table([thc("Person"), thc("Access"), thc("Sign-in"), thc("Status"), thc("Last seen"), thc("")].join(""), list.map((u) => row([
    `<div class="table-brand"><span class="avatar">${esc(initials(u.name || u.email))}</span><span class="person-cell"><b>${esc(u.name || "—")}${u.isMe ? ` <span class="you-tag">You</span>` : ""}</b><small>${esc(u.email)}</small></span></div>`,
    pill(ROLE[u.role] || u.role),
    u.hasPassword ? "Password or Microsoft" : "Microsoft only",
    u.active ? pill("Active", "ready") : pill("Switched off", "draft"),
    ago(u.lastSeenAt),
    `<div class="row-actions">${btn("Edit", { variant: "ghost", size: "sm", a: reg(() => openPersonDialog(u)) })}${u.isMe ? "" : btn("Delete", { variant: "ghost", size: "sm", cls: "danger-text", a: reg(() => confirmDeletePerson(u)) })}</div>`,
  ])).join(""))}</div>`;
}

function openPersonDialog(u = null) {
  const f = u ? { name: u.name, email: u.email, role: u.role, active: u.active, password: "", busy: false, error: "" } : { name: "", email: "", role: "staff", active: true, password: "", busy: false, error: "" };
  const okNow = () => !f.busy && f.name.trim() && (u || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) && (!f.password || f.password.length >= 8);
  const upd = () => { const b = $("#person-save"); if (b) b.disabled = !okNow(); };
  const roleOpts = Object.entries(ROLE_INFO).map(([k, [n]]) => ({ value: k, label: n }));
  const render = () => `${dlgHeader(u ? "Edit person" : "Add a person", u ? esc(u.email) : "They can sign in with Microsoft, or with the password you set here.")}<form data-sub="${reg(submit)}">
  <div class="form-field"><label for="p-name">Name</label>${input({ id: "p-name", value: f.name, inp: reg((v) => { f.name = v; upd(); }), attrs: 'maxlength="100" required' })}</div>
  ${u ? "" : `<div class="form-field"><label for="p-email">Email</label>${input({ id: "p-email", type: "email", value: f.email, placeholder: "name@creativheads.com", inp: reg((v) => { f.email = v; upd(); }), attrs: 'required autocomplete="off"' })}</div>`}
  <div class="form-field"><label>Access</label>${select(f.role, roleOpts, (v) => { f.role = v; renderDialog(); }, { label: "Access level" })}<p class="field-help">${ROLE_INFO[f.role][1]}</p></div>
  ${u ? `<div class="form-field person-active"><div><label>Account is on</label><p class="field-help">Switching it off signs them out and stops them signing in. Nothing they did is lost.</p></div>${toggle(f.active, reg(() => { f.active = !f.active; renderDialog(); }), { label: "Account is on" })}</div>` : ""}
  <div class="form-field"><label for="p-pass">${u ? "New password" : "Password"} <small>${u ? "leave empty to keep the current one" : "optional"}</small></label><div class="pass-row">${input({ id: "p-pass", value: f.password, placeholder: u ? "Unchanged" : "At least 8 characters", inp: reg((v) => { f.password = v; upd(); }), attrs: 'autocomplete="new-password"' })}${btn("Generate", { variant: "outline", a: reg(() => { f.password = genPassword(); renderDialog(); }) })}</div>
  <p class="field-help">${f.password ? "Copy it now. It can’t be shown again, and you’ll need to pass it to them yourself." : u ? "Setting one signs them out everywhere else." : "Leave empty if they will only use Microsoft."}</p></div>
  ${f.error ? `<p class="error-text" role="alert">${esc(f.error)}</p>` : ""}${dlgFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog), disabled: f.busy }) + btn((f.busy ? spin() : ic("check")) + (u ? "Save changes" : "Add person"), { type: "submit", disabled: !okNow(), attrs: 'id="person-save"' }))}</form>`;
  async function submit() {
    if (!okNow()) return; f.busy = true; f.error = ""; st.dialog.locked = true; renderDialog();
    try {
      if (u) await api(`/br/users/${u.id}`, { name: f.name, role: f.role, active: f.active, ...(f.password ? { password: f.password } : {}) });
      else await api("/br/users", { name: f.name, email: f.email, role: f.role, ...(f.password ? { password: f.password } : {}) });
      await loadPeople(true); await load(); st.dialog.locked = false; closeDialog(); toast.success(u ? "Changes saved" : "Person added"); renderShell();
    } catch (e) { f.error = e.message; f.busy = false; if (st.dialog) { st.dialog.locked = false; renderDialog(); } }
  }
  openDialog(render);
}

function confirmDeletePerson(u) {
  let busy = false;
  openDialog(() => `${alertHeader(`Delete ${esc(u.name || u.email)}?`, "They’ll be signed out and can’t sign in again. What they added stays in the workspace. To keep their account but stop access, switch it off instead.")}${alertFooter(btn("Cancel", { variant: "outline", a: reg(closeDialog), disabled: busy }) + btn(busy ? "Deleting…" : "Delete person", { disabled: busy, a: reg(async () => {
    busy = true; st.dialog.locked = true; renderDialog();
    try { await apiDelete(`/br/users/${u.id}`); await loadPeople(true); await load(); st.dialog.locked = false; closeDialog(); toast.success("Person deleted"); renderShell(); }
    catch (e) { toast.error(e.message); busy = false; if (st.dialog) { st.dialog.locked = false; renderDialog(); } } }) }))}`, { alert: true });
}

/* ================= Settings ================= */
function viewSettings() {
  const ws = st.ws; const S = sets; const cn = ws.connections || {};
  let content = "";
  if (S.tab === "connections") content = `<div class="connection-grid">${[
    { icon: "users", title: "Microsoft 365 sign-in", on: cn.microsoft, copy: "Staff sign in with their Microsoft account. Admin, Head and Staff roles apply.", steps: ["Register a single-tenant Microsoft Entra application.", "Add the tenant ID, client ID and secret in the hosting settings.", "Set the allowed domain and default role."] },
    { icon: "upload", title: "Image & document storage", on: cn.storage, copy: "Reference images and uploaded documents are kept in private storage.", steps: ["Create a private bucket in Supabase.", "Add the Supabase URL and service key in the hosting settings.", "Files are only ever served after sign-in."] },
    { icon: "braces", title: "Knowledge API for the SEO agent", on: cn.api, copy: "Lets the SEO site and other tools read brand knowledge. Read-only, and never includes internal notes, locked fields or team-only documents.", steps: ["Make a long random key for each tool.", "Add them as KB_API_KEYS in the hosting settings, like seo-agent:the-key.", "The tool sends it as Authorization: Bearer &lt;key&gt;."] },
  ].map((x) => `<div class="panel connection-card"><span class="icon-tile">${ic(x.icon)}</span><h2>${x.title}</h2>${pill(x.on ? "Connected" : "Not connected", x.on ? "ready" : "draft")}<p>${x.copy}</p><ol>${x.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>`).join("")}</div>`;
  else content = viewPeople();
  return `${pageHead("WORKSPACE SETTINGS", "Set the right boundaries.", "See what’s connected and who has access.")}${tabs(S.tab, [["connections", "Connections"], ["people", "People & roles"]], (v) => { S.tab = v; renderShell(); }, { content })}`;
}

/* ================= sign-in ================= */
const MS_LOGO = `<svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>`;
async function renderLogin(msg = "") {
  closeDialog(); REG = new Map();
  if (!st.pub) { try { st.pub = await (await fetch("/api/br/public", { cache: "no-store" })).json(); } catch { st.pub = { passwords: true }; } }
  const ms = !!st.pub.microsoft, pw = st.pub.passwords !== false;
  const passBlock = `<div class="form-field"><label for="li-email">Email</label>${input({ id: "li-email", type: "email", attrs: 'autocomplete="username" required' })}</div><div class="form-field"><label for="li-pass">Password</label>${input({ id: "li-pass", type: "password", attrs: 'autocomplete="current-password" required' })}</div>${btn("Sign in", { type: "submit", size: "lg", cls: "w-full", attrs: 'id="li-btn"' })}`;
  $("#app").innerHTML = `<div class="br-login"><form class="br-login-card" id="br-login"><div class="wordmark br-login-mark"><span class="app-mark">${ic("book-open", { size: 22 })}</span><span>brandroom<span class="wordmark-sub">BY CREATIVHEADS®</span></span></div><h1>Good work starts with context.</h1><p>Sign in to your team workspace.</p>
  <p class="error-text" id="li-err" role="alert"${msg ? "" : " hidden"}>${esc(msg)}</p>
  ${ms ? `<a class="br-ms-button" href="/api/auth/microsoft">${MS_LOGO}<span>Sign in with Microsoft</span></a>` : ""}
  ${ms && pw ? `<div class="br-or"><span>or</span></div><details class="br-pass-details"${msg ? " open" : ""}><summary>Sign in with a password</summary>${passBlock}</details>` : pw ? passBlock : ""}
  ${!ms && !pw ? `<p class="hint">No sign-in method is set up yet. Add the Microsoft details in the hosting settings.</p>` : ""}</form></div>`;
  const f = $("#br-login"); if (pw) $("#li-email")?.focus();
  f.onsubmit = async (e) => { e.preventDefault(); const b = $("#li-btn"); if (!b) return; b.disabled = true; const er = $("#li-err"); er.hidden = true;
    try { const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json", "x-requested-with": "app", "x-section": "kb" }, body: JSON.stringify({ email: $("#li-email").value, password: $("#li-pass").value }) }); const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not sign in."); await start(); }
    catch (x) { er.textContent = x.message; er.hidden = false; b.disabled = false; } };
}

/* ================= Libraries, skills, onboarding, keys ================= */
const AGENCY_LIBS = [["qc", "QC checklist"], ["template", "Templates"], ["sop", "Process SOPs"], ["media", "Music and stock"]];
const ag = { library: "qc", items: null, title: "", body: "", busy: false, error: "" };
const skState = { skills: null, slug: "", body: "", note: "", busy: false, error: "" };
const ob = { sessions: null, current: null, answer: "", name: "", website: "", instagram: "", busy: false, error: "" };
const ky = { keys: null, name: "", picked: { clients: true }, revealed: "", busy: false, error: "" };
const SKILL_SCOPES = ["caption-writing", "qc-check-scoring", "client-detection", "compression-dispatch", "asset-filing", "reminders", "ad-alerts", "seo-tasks"];

function viewAgency() {
  if (ag.items === null) { ag.items = false; api("/br/agency").then((d) => { ag.items = d.items || []; renderShell(); }).catch((e) => { ag.error = e.message; ag.items = []; renderShell(); }); }
  if (ag.items === false) return `<p class="hint">Loading agency libraries…</p>`;
  const items = ag.items.filter((i) => i.library === ag.library);
  return `<div class="bundle-head"><div><h2>Agency libraries</h2><p>One set for the whole agency. A change goes live only after an admin approves it.</p></div></div>
  ${tabs(ag.library, AGENCY_LIBS, (v) => { ag.library = v; ag.title = ""; ag.body = ""; renderShell(); }, { cls: "filter-tabs" })}
  ${ag.error ? `<p class="error-text">${esc(ag.error)}</p>` : ""}
  <div class="v21-list">${items.map((i) => `<article class="panel v21-card"><div class="v21-card-top">${pill(i.status === "approved" ? "Live" : "Draft", i.status === "approved" ? "ready" : "draft")}<h3>${esc(i.title)}</h3></div><p class="v21-body">${esc(i.body)}</p>${canEdit() ? `<div class="v21-actions">${btn("Edit", { variant: "outline", size: "sm", a: reg(() => { ag.title = i.title; ag.body = i.body; ag.editing = i.id; renderShell(); }) })}${st.me?.isAdmin && i.status !== "approved" ? btn("Approve", { size: "sm", a: reg(async () => { await api("/br/agency", { action: "approve", id: i.id }); ag.items = null; renderShell(); }) }) : ""}${btn("Remove", { variant: "ghost", size: "sm", a: reg(async () => { await api("/br/agency", { action: "remove", id: i.id }); ag.items = null; renderShell(); }) })}</div>` : ""}</article>`).join("") || `<p class="hint">Nothing here yet.</p>`}</div>
  ${canEdit() ? `<form class="panel v21-card" data-sub="${reg(async () => { ag.busy = true; ag.error = ""; try { await api("/br/agency", { id: ag.editing, library: ag.library, title: ag.title, body: ag.body }); ag.title = ""; ag.body = ""; ag.editing = null; ag.items = null; toast.success("Saved as a draft"); } catch (e) { ag.error = e.message; } finally { ag.busy = false; renderShell(); } })}"><h3>${ag.editing ? "Edit item" : "New item"}</h3><div class="form-field"><label for="ag-title">Title</label>${input({ id: "ag-title", value: ag.title, inp: reg((v) => (ag.title = v)) })}</div><div class="form-field"><label for="ag-body">Text</label>${textarea({ id: "ag-body", value: ag.body, rows: 6, inp: reg((v) => (ag.body = v)) })}</div>${btn(ag.busy ? "Saving…" : "Save draft", { type: "submit", disabled: ag.busy })}</form>` : ""}`;
}
function viewSkills() {
  if (skState.skills === null) { skState.skills = false; api("/br/skills").then((d) => { skState.skills = d.skills || []; if (!skState.slug && skState.skills[0]) { skState.slug = skState.skills[0].slug; const v = skState.skills[0].versions.at(-1); skState.body = v?.body || ""; } renderShell(); }).catch((e) => { skState.error = e.message; skState.skills = []; renderShell(); }); }
  if (skState.skills === false) return `<p class="hint">Loading skills…</p>`;
  const skill = skState.skills.find((s) => s.slug === skState.slug) || skState.skills[0];
  const live = skill?.versions.find((v) => v.version === skill.liveVersion);
  const draft = skill?.versions.filter((v) => v.status === "draft" || v.status === "in_review").at(-1);
  return `<div class="bundle-head"><div><h2>Skills</h2><p>Step-by-step instructions the bots load. Only an approved version is served, and it cannot be edited afterwards.</p></div></div>
  ${skState.error ? `<p class="error-text">${esc(skState.error)}</p>` : ""}
  <div class="v21-split"><div class="v21-list">${skState.skills.map((s) => `<button class="panel v21-card ${s.slug === skill?.slug ? "active" : ""}" data-a="${reg(() => { skState.slug = s.slug; const v = s.versions.filter((x) => x.status !== "retired").at(-1) || s.versions.at(-1); skState.body = v?.body || ""; renderShell(); })}"><b>${esc(s.name)}</b><small>${esc(s.usedBy)} · ${s.liveVersion ? "live v" + s.liveVersion : "no live version"}</small></button>`).join("")}</div>
  ${skill ? `<div class="panel v21-card"><h3>${esc(skill.name)}</h3><p class="hint">${live ? "Live version " + live.version : "Nothing is live yet."}</p>
  ${canEdit() ? `<div class="form-field"><label for="sk-body">Draft</label>${textarea({ id: "sk-body", value: skState.body, rows: 16, inp: reg((v) => (skState.body = v)) })}</div><div class="form-field"><label for="sk-note">What changed</label>${input({ id: "sk-note", value: skState.note, inp: reg((v) => (skState.note = v)) })}</div><div class="v21-actions">${btn("Save draft", { a: reg(async () => { await api("/br/skills", { slug: skill.slug, body: skState.body, changeNote: skState.note }); skState.skills = null; toast.success("Draft saved"); renderShell(); }) })}${draft ? btn("Approve as reviewer", { variant: "outline", a: reg(async () => { await api("/br/skills", { action: "review", versionId: draft.id, decision: "approve" }); skState.skills = null; renderShell(); }) }) : ""}${st.me?.isAdmin && draft ? btn("Publish", { a: reg(async () => { await api("/br/skills", { action: "publish", versionId: draft.id, onBehalf: true, comment: "Approved in Brandroom" }); skState.skills = null; toast.success("Published"); renderShell(); }) }) : ""}${st.me?.isAdmin && live ? skill.versions.filter((v) => v.status === "retired").slice(-1).map((v) => btn("Roll back to v" + v.version, { variant: "ghost", a: reg(async () => { await api("/br/skills", { action: "rollback", versionId: v.id }); skState.skills = null; renderShell(); }) })).join("") : ""}</div>` : `<pre class="v21-body">${esc(live?.body || "")}</pre>`}
  </div>` : ""}</div>`;
}
function viewOnboarding() {
  if (!canEdit()) return empty("lock", "Heads run onboarding", "Staff can read the libraries once a head has approved them.");
  if (ob.sessions === null) { ob.sessions = false; api("/br/onboarding").then((d) => { ob.sessions = d.sessions || []; ob.current = ob.sessions.find((s) => s.status !== "completed") || null; renderShell(); }).catch((e) => { ob.error = e.message; ob.sessions = []; renderShell(); }); }
  if (ob.sessions === false) return `<p class="hint">Loading…</p>`;
  const s = ob.current;
  if (!s) return `<div class="bundle-head"><div><h2>Onboarding interview</h2><p>Drafts a new client from its website and your answers. Nothing is saved to the client until you approve it.</p></div></div>
    ${ob.error ? `<p class="error-text">${esc(ob.error)}</p>` : ""}
    <form class="panel v21-card" data-sub="${reg(async () => { ob.busy = true; ob.error = ""; try { const d = await api("/br/onboarding", { businessName: ob.name, website: ob.website, instagram: ob.instagram }); ob.current = d.session; ob.sessions = null; } catch (e) { ob.error = e.message; } finally { ob.busy = false; renderShell(); } })}">
    <div class="form-field"><label for="ob-name">Business name</label>${input({ id: "ob-name", value: ob.name, inp: reg((v) => (ob.name = v)) })}</div>
    <div class="form-field"><label for="ob-web">Website</label>${input({ id: "ob-web", value: ob.website, placeholder: "example.com", inp: reg((v) => (ob.website = v)) })}</div>
    <div class="form-field"><label for="ob-ig">Instagram handle</label>${input({ id: "ob-ig", value: ob.instagram, placeholder: "brandname", inp: reg((v) => (ob.instagram = v)) })}</div>
    ${btn(ob.busy ? "Reading the public page…" : "Start", { type: "submit", disabled: ob.busy })}</form>`;
  const q = s.question;
  return `<div class="bundle-head"><div><h2>${esc(s.businessName)}</h2><p>${s.businessType ? esc(s.businessType) + " · " : ""}${s.status === "interviewing" ? (s.remaining + " questions left, at most") : "Review the drafts. Nothing is live until you apply them."}</p></div></div>
  ${q ? `<form class="panel interview" data-sub="${reg(async () => { const d = await api("/br/onboarding", { action: "answer", id: s.id, text: ob.answer }); ob.current = d.session; ob.answer = ""; renderShell(); })}"><div class="interview-kicker"><span>Question ${pad2(s.questionIndex + 1)}</span><span>${esc(q.why)}</span></div><p class="interview-why">Why we ask · ${esc(q.why)}</p><div class="interview-ask"><h2>${esc(q.label)}</h2></div>${textarea({ id: "ob-answer", value: ob.answer, rows: 5, placeholder: "Type the answer…", inp: reg((v) => (ob.answer = v)) })}<div class="interview-actions"><span></span><div>${btn("Skip", { variant: "ghost", a: reg(async () => { const d = await api("/br/onboarding", { action: "answer", id: s.id, skip: true }); ob.current = d.session; renderShell(); }) })}${btn("Next question", { type: "submit" })}</div></div></form>` : ""}
  <div class="v21-list">${(s.drafts || []).map((d) => `<article class="panel v21-card"><div class="v21-card-top">${pill(d.status, d.status === "rejected" ? "rejected" : "ready")}<small>${esc(d.source)} · ${esc(d.confidence)}</small></div><b>${esc(d.field)}</b><p class="v21-body">${esc(d.value)}</p>${d.status !== "rejected" ? `<div class="v21-actions">${btn(d.status === "pending" ? "Approve" : "Approved", { size: "sm", a: reg(async () => { const r = await api("/br/onboarding", { action: "draft", id: s.id, draftId: d.id, status: "approved" }); ob.current = r.session; renderShell(); }) })}${btn("Reject", { size: "sm", variant: "ghost", a: reg(async () => { const r = await api("/br/onboarding", { action: "draft", id: s.id, draftId: d.id, status: "rejected" }); ob.current = r.session; renderShell(); }) })}</div>` : ""}</article>`).join("")}</div>
  ${btn("Apply approved drafts", { disabled: ob.busy, a: reg(async () => { ob.busy = true; try { const r = await onboardApply(s.id); toast.success("Client updated"); go("client", r.client.id); } catch (e) { ob.error = e.message; toast.error(e.message); } finally { ob.busy = false; } }) })}
  ${ob.error ? `<p class="error-text">${esc(ob.error)}</p>` : ""}`;
}
async function onboardApply(id) { const r = await api("/br/onboarding", { action: "apply", id }); await load(); ob.sessions = null; ob.current = null; return r; }
function viewKeys() {
  if (!st.me?.isAdmin) return empty("lock", "Admins manage bot keys", "Each bot gets its own key. The full key is shown once.");
  if (ky.keys === null) { ky.keys = false; api("/br/keys").then((d) => { ky.keys = d.keys || []; ky.scopeList = d.scopes || []; renderShell(); }).catch((e) => { ky.error = e.message; ky.keys = []; renderShell(); }); }
  if (ky.keys === false) return `<p class="hint">Loading keys…</p>`;
  const scopes = (ky.scopeList || []).concat(SKILL_SCOPES.map((s) => "skill:" + s));
  return `<div class="bundle-head"><div><h2>Bot keys</h2><p>One read-only key per bot. Copy it into that bot’s hosting settings. It is not shown again.</p></div></div>
  ${ky.revealed ? `<p class="panel v21-card"><b>Copy this key now.</b><br><code>${esc(ky.revealed)}</code></p>` : ""}
  ${ky.error ? `<p class="error-text">${esc(ky.error)}</p>` : ""}
  <div class="v21-list">${ky.keys.map((k) => `<article class="panel v21-card"><b>${esc(k.name)}</b> <code>${esc(k.prefix)}…</code> ${pill(k.active ? "Active" : "Revoked", k.active ? "ready" : "rejected")}<p class="hint">${esc((k.scopes || []).join(", "))}${k.lastUsedAt ? " · last used " + dm(k.lastUsedAt) : ""}</p>${k.active ? btn("Revoke", { size: "sm", variant: "outline", a: reg(async () => { await api("/br/keys", { action: "revoke", id: k.id }); ky.keys = null; renderShell(); }) }) : ""}</article>`).join("") || `<p class="hint">No bot keys yet. Tools named in KB_API_KEYS still work.</p>`}</div>
  <form class="panel v21-card" data-sub="${reg(async () => { ky.busy = true; ky.error = ""; try { const picked = scopes.filter((s) => ky.picked[s]); const d = await api("/br/keys", { name: ky.name, scopes: picked, days: 365 }); ky.revealed = d.key; ky.name = ""; ky.keys = null; } catch (e) { ky.error = e.message; } finally { ky.busy = false; renderShell(); } })}">
  <div class="form-field"><label for="ky-name">Key name</label>${input({ id: "ky-name", value: ky.name, placeholder: "Quality Check Bot", inp: reg((v) => (ky.name = v)) })}</div>
  <div class="scope-grid">${scopes.map((s) => `<label class="scope-item"><input type="checkbox" ${ky.picked[s] ? "checked" : ""} data-a="${reg(() => { ky.picked[s] = !ky.picked[s]; renderShell(); })}"> ${esc(s)}</label>`).join("")}</div>
  ${btn(ky.busy ? "Creating…" : "Create key", { type: "submit", disabled: ky.busy })}</form>`;
}

/* ================= start ================= */
async function start() {
  // A failed Microsoft sign-in comes back as /#error=…
  const err = new URLSearchParams(location.hash.slice(1)).get("error");
  if (err) { history.replaceState(null, "", location.pathname); return renderLogin(err); }
  readHash(); st.ws = null; st.err = ""; renderShell();
  try { await load(); renderShell(); }
  catch (e) { if (e.status === 401) return; if (e.status === 403) { renderLogin(e.message); return; } st.err = e.message; renderShell(); }
}
start();
