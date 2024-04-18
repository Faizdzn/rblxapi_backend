const express = require("express");
const app = express.Router();

const userController = require("../../controller/userController.js")

app.get("/download3D", userController.getUserAvatar)
app.get("/detail", userController.getUserDetail)

module.exports = app;