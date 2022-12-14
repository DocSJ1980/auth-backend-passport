require('dotenv').config({ path: './config/config.env' });
const express = require('express');
const connectDatabase = require("./config/db.js");
const errorHandler = require('./middleware/error.js');
const passport = require('passport');
const bodyParser = require('body-parser');

//Database Connection
connectDatabase();

//Initialize express server
const app = express();

//Use express server for home route
app.use(bodyParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Use express server for other routes in routers
app.use("/api/auth", require("./routers/auth.js"));

app.get("/", (req, res, next) => {
    res.send("Api running");
});

app.use(passport.initialize());

//Error Handler (Should be last piece of middleware)
app.use(errorHandler);

//Pass the port
const PORT = process.env.PORT

//Initialize and confirm the server
const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
});