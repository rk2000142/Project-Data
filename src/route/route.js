const express = require("express");
const route = express.Router();

route.get("/", function (req, res) {
  res.status(200).send("testing api");
});

module.exports = route;
