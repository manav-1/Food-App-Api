require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cors = require("cors");
const config = require("./config");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const port = config.port;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/signup", async (req, res) => {
  console.log("req received");
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
    res.status(200).send(true);
  } catch (err) {
    res.status(400).send("TA");
  }
});

app.post("/api/login", async (req, res) => {
  console.log("req received");
  try {
    const { type, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(200).send(user);
    }

    return res.status(401).send("Invalid Credentials");
  } catch (err) {
    res.status(400).send("TA");
  }
});

app.listen(port, () => {
  console.log("Server started at ", port);
});
