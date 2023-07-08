const express = require("express")
require('dotenv').config()
const cors = require('cors')
const CustomerRoutes = require("./Routes/AuthRoutes/AuthRoutes")
const HotelRoutes = require("./Routes/HotelRoutes/HotelRoutes")
// database
require('./connection')
const app = express()

app.use(cors({
    origin: ["https://hotelio-dashboard-trickle.netlify.app", "https://hotelio-rooms.netlify.app", "http://localhost:3000", "https://64a7bfa211c85141111ecdff--friendly-sunflower-ffef72.netlify.app", "https://build-hotelio.vercel.app"]
}))


// some middlewares
app.use(express.json())



// variable Define 
const port = process.env.PORT || 8080


// routes

app.use("/api", CustomerRoutes);
app.use("/hotel", HotelRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to Hotelio Backend")
})







// server startt
app.listen(port, () => {
    console.log(`server started at port ${port}`)
})