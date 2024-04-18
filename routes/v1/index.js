const express = require("express");
const app = express.Router();

app.use("/user", require("./user.js"))
app.use("/item", require("./item.js"))
app.use("/group", require("./group.js"))

module.exports = app;