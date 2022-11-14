require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

//config jason response
app.use(express.json());

//models
const User = require("./models/User");

//Rota pública
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Ola mundo" });
});

//Rota privada
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //Ver se o usuário existe
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }
  return res.status(200).json({ user });
});

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
app.post("/auth/register", async (rec, res) => {
  const { name, email, password, confirmpassword } = rec.body;

  //validação
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas diferem" });
  }

  //verificar se o usuário já existe
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "Email já cadastrado" });
  }

  //criar senha
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //criar usuário
  const user = new User({
    name,
    email,
    password: passwordHash,
  });
  try {
    await user.save();
    res.status(201).json({ msg: "usuário criado com sucesso" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Opss um erro inesperado aconteceu" });
  }
});

//Autenticar/Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  //validações
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  //verificar se o usuário já existe
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  //verificar se a senha bate com a do banco
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(422).json({ msg: "senha invalida" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );
    res.status(200).json({ msg: "autenticação realizada com sucesso", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Opss um erro inesperado aconteceu" });
  }
});

//credenciais
const dbuser = process.env.DB_USER;
const dbpass = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbuser}:${dbpass}@cluster0.sqir2tw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("conexão bem sucedida");
  })
  .catch((err) => console.log(err));
