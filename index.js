require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cors = require("cors");
const config = require("./config");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const port = config.port;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("OKAY");
});

app.post("/api/signup", async (req, res) => {
  try {
    const { type, name, email, password } = req.body;

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(406).send("User Exists");
    }
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      type: type,
    });
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );
    var uData = { token, ...user._doc };
    return res.status(200).send(uData);
  } catch (err) {
    res.status(400).send("TA");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { type, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        { expiresIn: "2h" }
      );
      var uData = { token, ...user._doc };
      return res.status(200).send(uData);
    }

    return res.status(401).send("Invalid Credentials");
  } catch (err) {
    res.status(400).send("TA");
  }
});

app.post("/verifyUser", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send("Token is required");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    return res.status(200).send(true);
  } catch (err) {
    if (err.message == "jwt expired") {
      return res.status(406).send("Token Expired");
    }
    return res.status(401).send("Invalid Token");
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server started at ", port);
});
