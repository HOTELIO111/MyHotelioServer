const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const { Worker } = require("bullmq");
const AppRoutes = require("./Routes/app");
require("dotenv").config();
require("./config/connection");
const cors = require("cors");
const { BookingQue } = require("./jobs/BookingsQueue");
const { CreatePreBooking } = require("./Controllers/worker/BookingWorker");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const port = process.env.ENV === "production" ? process.env.PORT : 3001 || 8080;

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

app.get("/createprebook/:room", (req, res) => {
  try {
    const response = BookingQue.add(`${req.params.room} book now`, {
      name: "sourabh verma",
    });
    res.status(200).json({ error: false, message: "succes", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// quer workers
new Worker("pre-booking", CreatePreBooking);

// server startt
server.listen(port, () => {
  console.log(`server started at port ${port}`);
});
