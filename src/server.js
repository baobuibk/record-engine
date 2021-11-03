const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/check", (req, res) => res.send("ok"));

app.use("*", (req, res) => res.status(404).send("not found"));

module.exports = app;