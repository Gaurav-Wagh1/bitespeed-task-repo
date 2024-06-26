const express = require("express");

const { PORT } = require("./config/server-config");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(PORT, () => {
    console.log("Server listening on port - ", PORT);
});