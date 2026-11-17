// Checks every solution definition in solutions/: the shape, field types, choices,
// stages, the fields that rules name, and seed records. `npm run validate`; Forge
// runs the same checks before it loads a definition.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FIELD_TYPES = new Set(["text", "number", "currency", "date", "select", "bool", "person"]);
const KINDS = new Set(["register", "workflow", "program"]);
// Config keys that name one of the app's fields.
const FIELD_REFS = ["dueField", "statusField", "titleField", "leadField", "repeatField", "dateField", "amountField"];

let problems = 0;
const fail = (file: string, msg: string) => {
  problems++;
  console.error(`✗ ${file}: ${msg}`);
};

const files: string[] = [];
const walk = (dir: string) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".json")) files.push(p);
  }
};
walk("solutions");

const keys = new Map<string, string>();
for (const file of files) {
  let d: Record<string, any>;
  try {
    d = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    fail(file, `not valid JSON (${(e as Error).message})`);
    continue;
  }
  for (const k of ["key", "name", "version", "description", "apps"]) if (d[k] === undefined) fail(file, `missing "${k}"`);
  if (typeof d.key !== "string" || !/^[a-z][a-z0-9_-]*$/.test(d.key)) fail(file, `key "${d.key}" must be lowercase letters, digits, _ and -`);
  if (keys.has(d.key)) fail(file, `key "${d.key}" is also used by ${keys.get(d.key)}`);
  keys.set(d.key, file);
  if (typeof d.version !== "string" || !/^\d+\.\d+(\.\d+)?$/.test(d.version)) fail(file, `version "${d.version}" must be like 1.0`);
  if (!Array.isArray(d.apps) || !d.apps.length) {
    fail(file, "a solution needs at least one app");
    continue;
  }
  const types = new Set<string>();
  for (const app of d.apps) {
    const where = `app "${app.name ?? app.type}"`;
    if (!/^[a-z][a-z0-9_]*$/.test(app.type ?? "")) fail(file, `${where}: type must be lowercase letters, digits and _`);
    if (types.has(app.type)) fail(file, `${where}: type "${app.type}" appears twice`);
    types.add(app.type);
    if (!KINDS.has(app.kind)) fail(file, `${where}: kind must be register, workflow or program`);
    const fieldKeys = new Set<string>();
    for (const f of app.fields ?? []) {
      if (fieldKeys.has(f.key)) fail(file, `${where}: field "${f.key}" appears twice`);
      fieldKeys.add(f.key);
      if (!FIELD_TYPES.has(f.type)) fail(file, `${where}: field "${f.key}" has unknown type "${f.type}"`);
      if (f.type === "select" && !(Array.isArray(f.options) && f.options.length)) fail(file, `${where}: choice field "${f.key}" has no options`);
      if (!f.label) fail(file, `${where}: field "${f.key}" has no label`);
    }
    if (app.kind !== "program" && !fieldKeys.size) fail(file, `${where}: no fields`);
    const cfg = app.config ?? {};
    for (const ref of FIELD_REFS) if (typeof cfg[ref] === "string" && !fieldKeys.has(cfg[ref])) fail(file, `${where}: config.${ref} names "${cfg[ref]}", which is not a field`);
    const stages: { key: string }[] = cfg.stages ?? [];
    if (app.kind === "workflow" && !stages.length) fail(file, `${where}: a workflow needs stages`);
    if (app.kind === "register" && stages.length) fail(file, `${where}: a register has no stages; make it a workflow`);
    const stageKeys = new Set<string>();
    for (const st of stages) {
      if (stageKeys.has(st.key)) fail(file, `${where}: stage "${st.key}" appears twice`);
      stageKeys.add(st.key);
    }
    for (const c of cfg.closedStages ?? []) if (!stageKeys.has(c)) fail(file, `${where}: closed stage "${c}" is not a stage`);
  }
  for (const [type, rows] of Object.entries((d.seed ?? {}) as Record<string, Record<string, unknown>[]>)) {
    const app = d.apps.find((a: any) => a.type === type);
    if (!app) {
      fail(file, `seed for "${type}", which is not an app here`);
      continue;
    }
    const fieldKeys = new Set((app.fields ?? []).map((f: any) => f.key));
    rows.forEach((row, i) => {
      for (const k of Object.keys(row)) if (!fieldKeys.has(k)) fail(file, `seed for "${type}", record ${i + 1}: "${k}" is not a field`);
    });
  }
}
console.log(problems ? `\n${problems} problem(s) in ${files.length} definition(s)` : `✓ ${files.length} solution definitions are valid`);
process.exit(problems ? 1 : 0);
