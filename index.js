const express = require("express")
require('dotenv').config()
const cors = require('cors')
const Utils = require('./Routes/utils')
const CustomerRoutes = require("./Routes/AuthRoutes/AuthRoutes")
const HotelRoutes = require("./Routes/HotelRoutes/HotelRoutes")
const GoogleAuth = require('./Routes/AuthRoutes/GoogleAuth')
const VerifyRoutes = require("./Routes/AuthRoutes/VerificationRoutes")
// database
require('./connection')
const app = express()

app.use(cors({
    origin: [
        "http://www.hoteliorooms.com",
        "https://hotelio-dashboard-trickle.netlify.app",
        "https://hotelio-rooms.netlify.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://64a7bfa211c85141111ecdff--friendly-sunflower-ffef72.netlify.app",
        "https://build-hotelio.vercel.app",
        "http://ec2-16-16-248-78.eu-north-1.compute.amazonaws.com"
    ]
}))


// some middlewares
app.use(express.json())



// variable Define 
const port = process.env.PORT || 8080
app.use(express.static("./static"))


// routes
app.use("/util", Utils);

app.use("/api", CustomerRoutes);
app.use("/api/social", GoogleAuth)
app.use("/hotel", HotelRoutes);
// verfication related apis 
app.use("/verify", VerifyRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to Hotelio Backend")
})
// image Upload api 


// assets path 








// server startt
app.listen(port, () => {
    console.log(`server started at port ${port}`)
})
