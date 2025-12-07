# BugTrack

Aplicatie web pentru gestionarea bug-urilor intr-un proiect software.

## Scop
- Utilizatorii se autentifica cu email + parola.
- Membrii proiect (MP) pot crea proiecte, pot vedea si actualiza bug-uri.
- Testeri (TST) pot crea bug-uri: severitate, prioritate, descriere, link la commit.
- Integrare cu un serviciu extern (GitHub API) pentru validarea commit-urilor.

## Tehnologii (conform cerinte tehnice)
- Front-end: React (SPA, component-based).
- Back-end: Node.js + Express (REST).
- ORM: Sequelize (relational).
- Baza de date: SQLite
- Serviciu extern: GitHub API.

## Organizare repo
- `docs/` – documentatie (specificatii, plan, API).
- `client/` – aplicatia React (folder gol in acest moment).
- `server/` – API Node/Express.
