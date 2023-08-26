const express = require("express")
require('dotenv').config()
const cors = require('cors')
const Utils = require('./Routes/utils')
const CustomerRoutes = require("./Routes/AuthRoutes/AuthRoutes")
const HotelRoutes = require("./Routes/HotelRoutes/HotelRoutes")
const VerifyRoutes = require("./Routes/AuthRoutes/VerificationRoutes")
// database
require('./connection')
const app = express()

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://www.hoteliorooms.com');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// app.use(cors({
//     origin: [
//         "http://www.hoteliorooms.com",
//         "https://www.hoteliorooms.com",
//         "https://hotelio-dashboard-trickle.netlify.app",
//         "https://hotelio-rooms.netlify.app",
//         "http://localhost:3000",
//         "http://localhost:3001",
//         "https://64a7bfa211c85141111ecdff--friendly-sunflower-ffef72.netlify.app",
//         "https://build-hotelio.vercel.app",
//         "http://ec2-16-16-248-78.eu-north-1.compute.amazonaws.com"
//     ]
// }))

app.use(cors())

// some middlewares
app.use(express.json())



// variable Define 
const port = process.env.PORT || 8080
app.use(express.static("./static"))


// routes
app.use("/util", Utils);

app.use("/api", CustomerRoutes);
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
