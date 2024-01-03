const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { Worker } = require("bullmq");
const AppRoutes = require("./Routes/app");
const bodyparser = require("body-parser");
require("dotenv").config();
require("./config/connection");
const cors = require("cors");
const { BookingQue } = require("./jobs");
const { CreatePreBooking } = require("./Controllers/worker/BookingWorker");
const { EmailWorker } = require("./Controllers/worker/EmailNotification");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const port = process.env.ENV === "production" ? process.env.PORT : 3001 || 8080;

app.use(cors());
app.use(bodyparser.json());

// some middlewares
// app.use(express.json());

// variable Define
app.use(express.static("./static"));

// Global Variables
global.roomCount = [];

// routes
app.use("/", AppRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Hotelio Backend");
});

// quer workers
new Worker("booking", CreatePreBooking);
new Worker("Email-Notification", EmailWorker);

// server startt
server.listen(port, () => {
  console.log(`server started at port ${port}`);
});
