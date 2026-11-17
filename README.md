# forge-solutions

Solution definitions for [Forge](https://www.forgeprivate.com), by Sudhanva Labs. A **solution** is
a set of apps for one process, installed into a workspace by its admin: **registers** (lists of
records with fields), **workflows** (registers whose records move through stages), **program apps**
(Python run in Forge's sealed program runner), their rules, and the content they ship, such as a
library of maintenance tasks.

A definition is a template only. Installing it creates the apps in the customer's workspace, and
every record, stage, program result and audit entry stays in Forge's database there. This
repository never holds anyone's data.

## Solutions

| Folder | Solution | Apps |
|---|---|---|
| `solutions/forge-maintenance/` | Forge Maintenance, a pack each for a residential community, a factory, commercial property and a warehouse | Assets, Maintenance plans, Meter readings, Maintenance task library (registers); Work orders, AMC renewals (workflows) |
| `solutions/forge-operations/` | Forge Operations: Finance, Admin and legal, Sales and marketing | Bank statement classifier, Vendor onboarding, Contract milestones (workflows); Leads assistant (register) |
| `solutions/forge-executive/` | Forge Executive | Team, Commitments, Check-ins (registers), with its conversations in Kelvi |
| `solutions/forge-answers/` | Forge Answers | Answer tests (register) |

## Working on a definition

```
npm install
npm run validate
```

`BUILD-A-SOLUTION.md` explains the format and how a definition reaches Forge. Kelvi features for
one person are built as **skills**, in [kelvi-skills](https://github.com/sudhanvalabs/kelvi-skills);
a solution names the skills its conversations use.

## Status

Forge's code is still the source of these definitions: they are exported from it
(`scripts/export-solutions.ts` in Forge) until Forge loads them from here, the next step in
Forge's plan. Changes made here are reviewed and carried into Forge until then.

## Licence

Apache License 2.0 (`LICENSE`). Copyright 2026 Sudhanva Labs LLP.
