const express = require("express");

const { PORT } = require("./config/server-config");
const router = require("./routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.listen(PORT, () => {
    console.log("Server listening on port - ", PORT);
});