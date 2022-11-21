require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

//models
const User = require("./models/User");
const UserController = require("./Controllers/UserController");
const ProfessionalCardController = require("./Controllers/ProfessionalCardController");
const NormalCardController = require("./Controllers/NormalCardController");

//Rota pública
router.get("/", (req, res) => {
  res.status(200).json({ msg: "Ola mundo" });
});

//Rotas privadas
router.get("/user/:id", checkToken, UserController.getUserByID);

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "acesso negado" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(400).json({ msg: "Token inválido" });
  }
}

//criar usuário
router.post("/auth/register", UserController.createUser);

//Autenticar/Login
router.post("/auth/login", UserController.login);

// criar card profissional
router.post("/card/pro", ProfessionalCardController.createCard);

// ver cards profissionais de um usuário
router.get("/card/pro/:userId", ProfessionalCardController.getUserCards);

// mudar infos de um card profissional
router.patch("/card/pro/:cardId", ProfessionalCardController.changeInfo);

// muda a data de um card profissional
router.patch("/card/pro/date/:cardId", ProfessionalCardController.updateDate);

// criar card comum
router.post("/card", NormalCardController.createCard);

// ver cards comunss de um usuário
router.get("/card/:userId", NormalCardController.getUserCards);

// mudar infos de um card comum
router.patch("/card/:cardId", NormalCardController.changeInfo);

// muda a data de um card comum
router.patch("/card/date/:cardId", NormalCardController.updateDate);

module.exports = router;
