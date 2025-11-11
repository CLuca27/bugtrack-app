# API REST – specificatie minima

## Auth
- **POST** `/auth/register` – body: `{ email, password, name }` → 201
- **POST** `/auth/login` – body: `{ email, password }` → seteaza cookie → 200
- **POST** `/auth/logout` → 204
- **GET**  `/auth/me` → date user curent

## Projects
- **POST** `/projects` – body: `{ name, repoUrl }` → 201 (user logat)
- **GET**  `/projects` → proiectele unde userul este membru
- **GET**  `/projects/:id` → detalii proiect (inclusiv membri)
- **POST** `/projects/:id/members` – body: `{ userId, role }` (MP)
- **POST** `/projects/:id/join` – user curent devine TST (workflow simplu)

## Bugs
- **POST** `/projects/:id/bugs` – body: `{ title, description, severity, priority, commitUrl? }` (TST/MP)
- **GET**  `/projects/:id/bugs` – query: `status?`, `priority?`, `assigneeId?`
- **GET**  `/bugs/:bugId` – detalii bug
- **PATCH** `/bugs/:bugId/assign` – body: `{ assigneeId|null }` (MP)
- **PATCH** `/bugs/:bugId/status` – body: `{ newStatus, fixCommitUrl? }` (MP)
- **GET**  `/bugs/:bugId/updates` – istoric status
