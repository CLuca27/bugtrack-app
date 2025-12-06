
🚀 BugTrack App – Documentație Backend

Acesta este backend-ul aplicației BugTrack, construit în Node.js, folosind:

Express

Express-Session (autentificare prin sesiuni)

Sequelize ORM

SQLite pentru stocarea datelor

Aplicația rulează local pe:

http://localhost:7000

📦 Instalare

Asigurati-va că ati instalat Node.js (versiunea 16+).

Apoi, în terminal:

git clone https://github.com/CLuca27/bugtrack-app.git
cd bugtrack-app
npm install


Aceasta va instala toate pachetele listate în package.json:

-express
-express-session
-sqlite3
-sequelize
-bcrypt
-jsonwebtoken 
-nodemon

▶️ Rulare server

Pentru a porni serverul în modul development:

npm run dev

Serverul rulează pe:

http://localhost:7000

📁 Structura proiectului
bugtrack-app/
  server/
    app.js
    models/
    router/
    middleware/
  package.json
  README.md

📘 Endpoints API

////////////////////////////////////
🧑‍💻 USER ENDPOINTS (/api/users)
POST /api/users/register

Înregistrează un utilizator.

{
  "email": "user@example.com",
  "password": "123456"
}

POST /api/users/login

Autentifică utilizatorul și creează sesiunea.

GET /api/users/profile

Returnează datele utilizatorului logat.

////////////////////////////////////
🧩 PROJECT ENDPOINTS (/api/projects)

Toate necesită autentificare (middleware: authenticateSession).

POST /api/projects/create

Creează un proiect nou și îl asociază utilizatorului ca MP.

Body:

{
  "name": "Project 1",
  "repositoryLink": "https://github.com/example",
  "status": "Done",
  "description": "Test project"
}

GET /api/projects/

Returnează toate proiectele la care utilizatorul este membru (TST sau MP).

GET /api/projects/:id

Returnează detalii dintr-un proiect dacă userul este asociat cu el.

PUT /api/projects/:id

Modifică proiectul → doar MP are voie.

POST /api/projects/:id/add-tester

Permite unui user să se înregistreze ca TST într-un proiect.

////////////////////////////////////
🐞 BUG ENDPOINTS (/api/bugs)
GET /api/bugs?projectId={id}

Returnează toate bug-urile dintr-un proiect în care userul este TST/MP.

POST /api/bugs/

Creează un bug nou.
➡ Doar TST poate crea bug-uri.

Body:

{
  "projectId": 1,
  "description": "Bug description",
  "severity": "High",
  "priority": "P1",
  "commitLink": "https://github.com/commit/123"
}

PUT /api/bugs/:id

Modifică statusul unui bug.
➡ Doar MP poate modifica.

PUT /api/bugs/:id/assign

Asignează bug-ul unui membru MP.
