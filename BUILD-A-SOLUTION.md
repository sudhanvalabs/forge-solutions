# Build a Forge solution

A solution hands a business process to Forge: a team's records, the stages work moves through, the
rules that raise work by itself, and the content it starts with. This guide is for people and AI
coding agents writing one.

## The format

One JSON file per solution, or one per pack when a solution comes in variants (Forge Maintenance's
residential, factory, commercial and warehouse packs share a `family`). `schema/solution.schema.json`
describes it, so an editor checks it as you type.

```json
{
  "key": "clinic",
  "name": "Forge Clinic",
  "version": "1.0",
  "description": "Patients, appointments and billing for a small clinic.",
  "apps": [
    {
      "type": "clinic_patients",
      "name": "Patients",
      "kind": "register",
      "fields": [
        { "key": "name", "label": "Name", "type": "text", "required": true },
        { "key": "phone", "label": "Phone", "type": "text" },
        { "key": "dob", "label": "Date of birth", "type": "date" }
      ]
    },
    {
      "type": "clinic_appointments",
      "name": "Appointments",
      "kind": "workflow",
      "fields": [
        { "key": "patient", "label": "Patient", "type": "text", "required": true },
        { "key": "on", "label": "Date", "type": "date", "required": true },
        { "key": "fee", "label": "Fee", "type": "currency" }
      ],
      "config": {
        "dueField": "on",
        "stages": [
          { "key": "booked", "label": "Booked", "capability": "intake" },
          { "key": "seen", "label": "Seen", "capability": "review" },
          { "key": "billed", "label": "Billed", "capability": "export" }
        ],
        "closedStages": ["billed"]
      }
    }
  ]
}
```

- **Field types:** text, number, currency, date, select (with `options`), bool, person.
- **A register** has fields. **A workflow** has fields and `config.stages`, with `closedStages` for
  the stages where work is finished. **A program app** has Python code, run with no network and a
  fixed set of packages.
- **Rules** in `config` name fields: `dueField` (the date work falls due), `statusField`,
  `leadField` (days of warning), and others; the validator checks each names a real field.
- **`seed`** holds records the solution ships, by app type, such as a task library. Never anyone's
  data.
- **`forge`** lists the parts still written as code in Forge (Home panels, the Home card, daily
  work, install steps). A new solution should need none; ask if yours does.

Read `solutions/forge-maintenance/factory.json` for a full example.

## Rules

1. Name apps for what people call them ("Work orders", not "WO tracker"), and keep field labels
   plain.
2. Give every app `type` a prefix for the solution (`clinic_`), so types never clash.
3. A choice field's options are what people pick, in the order they would read them.
4. Put arithmetic and checks in program apps or rules, never in an AI prompt.
5. Ship content (`seed`) only when it is general: a maintenance task library, not one customer's
   assets.
6. Never change a field's `key`, or remove a field or stage, in a new version without saying how
   existing records move: Forge applies new fields and choices by itself, and anything that would
   move or remove data needs a reviewed upgrade step.

## Done means

- `npm run validate` passes.
- The pull request says who the solution is for, each app and its stages, and the rules.
- A maintainer reviews it and tags a version. Forge installs it in a test workspace, then offers it
  to workspaces from Org settings → Solutions.
