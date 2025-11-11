
# Specificatii tehnice – BugTrack U (Documentatie)

## 1. Arhitectura
- Aplicatie Single Page Application (React) care comunica prin HTTP/JSON cu un back-end REST (Node/Express).
- Baza de date relationala accesata printr-un ORM.
## 2. Front-end
- Framework: React (SPA, component-based).
- Routing: React Router (navigare intre pagini fara reload).
- HTTP: fetch (apeluri REST).
- Stiluri: CSS simplu (la alegere: CSS simplu / CSS Modules / Tailwind).

## 3. Back-end
- Platforma: Node.js
- Framework: Express
- Autentificare: email + parola (hash parola) si sesiune cu token in cookie httpOnly.
- Structura REST pe resurse: auth, projects, bugs, github (validate commit).

## 4. Baza de date si ORM
- ORM: Prisma sau Sequelize (compatibile cu Node.js si baze relationale).
- Dev: SQLite (fisier local). --> Doar pentru test
- Prod: PostgreSQL.
- Entitati principale (chei si relatii):
  - `User(id, email, passwordHash, name, createdAt)`
  - `Project(id, name, repoUrl, createdById, createdAt)`
  - `ProjectMember(id, userId, projectId, role[MP|TST], addedAt)` — unicitate (userId, projectId)
  - `Bug(id, projectId, createdById, assigneeId?, title, description, severity[LOW|MEDIUM|HIGH|CRITICAL], priority[P4|P3|P2|P1], commitUrl?, status[OPEN|IN_PROGRESS|RESOLVED|CLOSED], createdAt, updatedAt)`
  - `BugUpdate(id, bugId, updatedById, newStatus, note?, fixCommitUrl?, createdAt)`

## 5. Roluri si permisiuni
- MP (member proiect): creeaza/editeaza proiecte, vede/actualizeaza bug-uri, isi poate aloca bug-uri.
- TST (tester): creeaza bug-uri si vizualizeaza bug-urile proiectului.

## 6. Securitate
Parolele sunt hash-uite, folosim token in cookie pentru sesiune, verificam rolurile (MP/TST) si campurile de formular.
