const express = require("express");
const authRouter = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

authRouter.use(bodyParser.json());

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, "zahro_secret");
    res.json({ name: user.name, email: user.email, token });
  } catch (error) {
    res.status(400).json({ error });
  }
});

authRouter.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = authRouter;

// const express = require("express");
// const authRouter = express.Router();
// require("dotenv").config();

// const { validateRegister } = require("../middlewares/auth.middleware");
// const { db } = require("./firebase");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// authRouter.post("/register", validateRegister, async (req, res) => {
//   const data = await req.body;

//   const usersDb = db.collection("users");
//   const responseUser = await usersDb.where("email", "==", data.email).get();
//   let arrayUser = [];
//   responseUser.forEach((doc) => {
//     arrayUser.push(doc.data());
//   });

//   if (arrayUser.length < 1) {
//     const hashedPassword = bcrypt.hashSync(data.password, 10);
//     data.password = hashedPassword;

//     const id = "_" + new Date().getTime();
//     const json = {
//       id: id,
//       email: data.email,
//       password: data.password,
//       fullName: data.fullName,
//       role: data.role,
//     };

//     const userDb = db.collection("users").doc(id);
//     await userDb.set(json);
//     res.status(201).json({
//       message: "Register Success",
//     });
//   } else {
//     res.status(401).json({
//       message: "Email Registered",
//     });
//   }
// });

// authRouter.post("/login", async (req, res) => {
//   const data = await req.body;

//   const usersDb = db.collection("users");
//   const responseUser = await usersDb.where("email", "==", data.email).get();
//   let arrayUser = [];
//   responseUser.forEach((doc) => {
//     arrayUser.push(doc.data());
//   });

//   if (arrayUser.length < 1) {
//     res.status(401).json({
//       message: "Email is not registered",
//     });
//   } else {
//     const check = bcrypt.compareSync(data.password, arrayUser[0].password);

//     if (check) {
//       const loginToken = jwt.sign(
//         {
//           id: arrayUser[0].id,
//           email: arrayUser[0].email,
//           fullName: arrayUser[0].fullName,
//           role: arrayUser[0].role,
//         },
//         process.env.JWTKEY,
//         { expiresIn: "1d" }
//       );

//       const userData = {
//         id: arrayUser[0].id,
//         email: arrayUser[0].email,
//         fullName: arrayUser[0].fullName,
//         role: arrayUser[0].role,
//       };

//       res.send({
//         message: "Login Success",
//         userData,
//         loginToken,
//       });
//     } else {
//       res.status(401).json({
//         message: "Invalid Password",
//       });
//     }
//   }
// });

// authRouter.get("/users", async (req, res) => {
//   const dataDb = db.collection("users");
//   const response = await dataDb.get();
//   let dataArray = [];
//   response.forEach((doc) => {
//     dataArray.push(doc.data());
//   });
//   res.send(dataArray);
// });

// module.exports = authRouter;
