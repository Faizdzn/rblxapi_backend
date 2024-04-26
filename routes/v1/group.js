const express = require("express");
const app = express.Router();

const groupController = require("../../controller/groupController.js")

app.get("/detail", groupController.getDetail)

module.exports = app;