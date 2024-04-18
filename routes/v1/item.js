const express = require("express");
const app = express.Router();

const itemController = require("../../controller/itemController.js")

app.get("/download3D", itemController.getItem3D)
app.get("/detail", itemController.getItemDetail)

module.exports = app;