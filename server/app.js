const express = require('express') 
const app = express() 
const path = require('path') // <--- 1. AM ADAUGAT ASTA
const sequelize = require('./sequelize') 
const routers = require('./router/routers')
const session = require('express-session') 
const cors = require('cors')

app.use(express.json())  

// CORS poate rămâne așa, sau poți permite orice origine pentru simplificare pe server
app.use(cors({
  origin: "http://localhost:5173", // Local merge
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key',  
  resave: false,              
  saveUninitialized: false,   
  cookie: {   
    httpOnly: true,
    sameSite: "lax", 
    secure: false, 
    resave: false, 
    saveUninitialized: false
  }
})); 

// Rutele tale de API (Rămân neschimbate)
app.use("/api/users", routers.userRouter) 
app.use("/api/bugs", routers.bugRouter) 
app.use("/api/projects", routers.projectRouter) 

// -------------------------------------------------------------------------
// 2. AM ADAUGAT ACEASTA SECTIUNE PENTRU DEPLOY (SERVIREA FRONTEND-ULUI)
// -------------------------------------------------------------------------

// Spunem serverului să caute fișiere statice (HTML, CSS, JS) în folderul build al React
app.use(express.static(path.join(__dirname, '../client/build')));

// Orice rută care NU este de API (gen /dashboard, /login), o trimitem către React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// -------------------------------------------------------------------------

app.listen(7000, async() => {
    try 
    {
        console.log('Server is running on port 7000....') 
        await sequelize.sync() 
        console.log('All models were synchronized succesfully') 
        await sequelize.authenticate() 
        console.log("The connection to the database was established succesfully !")
    } 
    catch(error) 
    {
      console.log("Error connecting to the database", error)
    }
})