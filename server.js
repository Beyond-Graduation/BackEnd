require("dotenv").config(); // load .env variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const { log } = require("mercedlogger"); // import mercedlogger's log function
const cors = require("cors"); // import cors
// const UserRouter = require("./controllers/User") //import User Routes
// const TodoRouter = require("./controllers/Todo") // import Todo Routes
const { createContext, isLoggedIn } = require("./controllers/middleware");
const AlumniRouter = require("./controllers/Alumni"); // import Alumni Routes
const BlogRouter = require("./controllers/Blog"); // import Blog Routes
const StudentRouter = require("./controllers/Student");
const UserRouter = require("./controllers/User");
const AdminRouter = require("./controllers/Admin");
const NoticeRouter = require("./controllers/Notice");
const InternshipRouter = require("./controllers/Internship");
const { loadWord2VecModel } = require("./word2vecLoader");

// DESTRUCTURE ENV VARIABLES WITH DEFAULT VALUES
const { PORT = 3000 } = process.env;

// Create Application Object
const app = express();

// GLOBAL MIDDLEWARE
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json()); // parse json bodies
app.use(createContext); // create req.context


loadWord2VecModel();
// ROUTES AND ROUTES
app.get("/", (req, res) => {
    res.send("server is working");
});
// app.use("/user", UserRouter) // send all "/user" requests to UserRouter for routing
// app.use("/todos", TodoRouter) // send all "/todos" request to TodoROuter
app.use("/alumni", AlumniRouter); // send all "/alumni" request to AlumniROuter
app.use("/blog", BlogRouter); // send all "/Blog" request to BlogROuter
app.use("/student", StudentRouter);
app.use("/user", UserRouter);
app.use("/admin", AdminRouter);
app.use("/notice", NoticeRouter);
app.use("/internship", InternshipRouter);

// APP LISTENER
app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));


// loadWord2VecModel().then(() => {
//     // ROUTES AND ROUTES
//     app.get("/", (req, res) => {
//         res.send("server is working");
//     });
//     // app.use("/user", UserRouter) // send all "/user" requests to UserRouter for routing
//     // app.use("/todos", TodoRouter) // send all "/todos" request to TodoROuter
//     app.use("/alumni", AlumniRouter); // send all "/alumni" request to AlumniROuter
//     app.use("/blog", BlogRouter); // send all "/Blog" request to BlogROuter
//     app.use("/student", StudentRouter);
//     app.use("/user", UserRouter);
//     app.use("/admin", AdminRouter);
//     app.use("/notice", NoticeRouter);
//     app.use("/internship", InternshipRouter);

//     // APP LISTENER
//     app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));
// }).catch((error) => {
//     console.error('Failed to load the GloVe model:', error);
// });