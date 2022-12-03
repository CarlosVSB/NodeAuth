require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("./routes");
const cors = require("cors");

const app = express();

app.use(cors());
//config jason response
app.use(express.json());

app.use(router);
const port = process.env.PORT || 3001;

//credenciais
const dbuser = process.env.DB_USER;
const dbpass = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbuser}:${dbpass}@cluster0.sqir2tw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(port);
    console.log("conexão bem sucedida");
  })
  .catch((err) => console.log(err));
