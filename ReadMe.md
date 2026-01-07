# Work Logbook

A lightweight work logging app with components, impact tracking, uploads, and dashboard filters.

## Features
- Add/edit work logs with title, description, hours, component, impact text, impact level slider (low → very high), metrics, challenges, iterations, failures, and image uploads.
- Component combobox with search + “add new” inline; new components are remembered.
- Dashboard filters by search, date range, impact level, and component; shows applied filters and total shown vs total logs.
- Log cards display component and impact badges; attachments previewable.
- File-backed storage (no database) with seed data and component persistence.

## Getting Started
Prerequisites: Node 18+ and npm (or pnpm/yarn).

```bash
npm install
npm run dev    # starts server+client (Vite) on http://localhost:5000 by default
```

Environment:
- `PORT` (optional) defaults to `5000`.
- Uploads are stored under `client/public/uploads` and served at `/uploads/...`.
- Data is persisted to `data/worklogs.json` and `data/components.json`.

## Usage Tips
- From the “Add Log” sheet, pick or add a component via the combobox. If your entry is new, choose “Add” to save it for future use.
- Use the impact slider to set Low/Medium/High/Very High. This feeds dashboard filtering and card badges.
- Dashboard filters support:
  - Search by title/description
  - Date range (`From` / `To`)
  - Impact level
  - Component
  - Clear filters button resets all
- Images: attach via the upload dropzone; stored locally in `client/public/uploads`.

## API (summary)
- `GET /api/logs` — list logs
- `POST /api/logs` — create log (see shared schema)
- `PUT /api/logs/:id` — update log
- `DELETE /api/logs/:id` — delete log
- `GET /api/components` — list components
- `POST /api/components` — create component
- `POST /api/upload` — upload image (returns `{ url }`)

Schemas live in `shared/schema.ts`; routes in `shared/routes.ts`. File storage logic is in `server/storage.ts`.

