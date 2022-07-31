require("dotenv").config() // load .env variables
const express = require("express") // import express
const morgan = require("morgan") //import morgan
const {log} = require("mercedlogger") // import mercedlogger's log function
const cors = require("cors") // import cors
// const UserRouter = require("./controllers/User") //import User Routes
// const TodoRouter = require("./controllers/Todo") // import Todo Routes
const {createContext, isLoggedIn} = require("./controllers/middleware")
const AlumniRouter = require("./controllers/Alumni") // import Alumni Routes
const BlogRouter = require("./controllers/Blog") // import Blog Routes
const StudentRouter = require("./controllers/Student")
const LoginRouter = require("./controllers/Login")


//DESTRUCTURE ENV VARIABLES WITH DEFAULT VALUES
const {PORT = 3000} = process.env

// Create Application Object
const app = express()

// GLOBAL MIDDLEWARE
app.use(cors()) // add cors headers
app.use(morgan("tiny")) // log the request for debugging
app.use(express.json()) // parse json bodies
app.use(createContext) // create req.context


// ROUTES AND ROUTES
app.get("/", (req, res) => {
    res.send("server is working")
})
// app.use("/user", UserRouter) // send all "/user" requests to UserRouter for routing
// app.use("/todos", TodoRouter) // send all "/todos" request to TodoROuter
app.use("/alumni", AlumniRouter) // send all "/alumni" request to AlumniROuter
app.use("/blog", BlogRouter) // send all "/Blog" request to BlogROuter
app.use("/student", StudentRouter) 
app.use("/login", LoginRouter) 

// APP LISTENER
app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`))