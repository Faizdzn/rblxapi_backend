const express = require("express");
const app = express.Router();

app.use("/v1", require("./v1/index.js"))

module.exports = app;