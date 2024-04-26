const express = require("express");
const app = express.Router();

const gameController = require("../../controller/gameController.js")

app.get("/detail", gameController.getDetail)

module.exports = app;