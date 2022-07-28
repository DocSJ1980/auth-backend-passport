require('dotenv').config({ path: './config/config.env' });
const express = require('express');

//Database Connection
const connectDatabase = require("./config/db.js");
connectDatabase();

//Initialize express server
const app = express();

//Use express server for home route
app.use(express.json());
app.get("/", (req, res, next) => {
    res.send("Api running");
});

//Use express server for other routes in routers
app.use("/api/auth", require("./routers/auth.js"));

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