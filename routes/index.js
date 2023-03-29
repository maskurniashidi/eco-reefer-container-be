const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");

router.get("/", (req, res) => {
  res.send("Hello World");
});

router.use("/api/auth", authRouter);

module.exports = router;
