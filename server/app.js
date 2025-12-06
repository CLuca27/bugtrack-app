const express = require('express') 
const app = express() 
const sequelize = require('./sequelize') 
const routers = require('./router/routers')

app.use(express.json()) 


app.use("/api/users", routers.userRouter) 
app.use("api/bugs", routers.bugRouter) 
app.use("api/projects", routers.projectRouter) 


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