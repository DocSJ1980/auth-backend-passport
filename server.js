require('dotenv').config({ path: './config/config.env' });
const express = require('express');

const app = express();

app.use(express.json());
app.get("/", (req, res, next) => {
    res.send("Api running");
});
app.use("/api/auth", require("./routers/auth.js"));

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})