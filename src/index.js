const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");
const mongoose = require("mongoose");
const multer = require("multer")
const app = express();

//------------------- Global or Application level Middleware-------------------//
app.use(bodyParser.json());
app.use(multer().any()); 
app.use(bodyParser.urlencoded({ extended: true }));

//------------------- Connection Establishment Between Application and Database -------------------//
mongoose.connect("mongodb+srv://linagodbole99:dAix1EtU6C6yxJDR@cluster0.oip3eje.mongodb.net/group23Database",
    { useNewUrlParser: true,})
  .then(() => console.log("MongoDb is connected!"))
  .catch((err) => console.log(err));

  
app.use("/", route);

app.use("*", (req, res) => {
  return res
    .status(400)
    .send({ status: false, message: "please enter valid url endpoint" });
});

//------------------- Server Configuration -------------------//

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});