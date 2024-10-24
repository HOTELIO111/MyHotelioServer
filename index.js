const express = require("express");
const admin = require("firebase-admin");
const { createServer } = require("http");
const AppRoutes = require("./Routes/app");
require("./jobs/worker/index");
require("dotenv").config();
require("./config/connection");
const cors = require("cors");
const UserVerify = require("./middlewares/Reviews/VerifyUser");
const app = express();
const server = createServer(app);

const port = process.env.PORT || 8080;
// const serviceAccount = require("hotelio-4eb3d-firebase-adminsdk-i2rph-5b189ed3ed.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

app.use(cors());

// some middlewares
app.use(express.json());

// variable Define
app.use(express.static("./static"));

// routes
app.use("/", AppRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Hotelio Backend");
});

// server startt
server.listen(port, () => {
  console.log(`server started at port ${port}`);
});
