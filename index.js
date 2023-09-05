const express = require("express")
require('dotenv').config()
const cors = require('cors')
const Utils = require('./Routes/utils')
const CustomerRoutes = require("./Routes/AuthRoutes/auth")
const HotelRoutes = require("./Routes/HotelRoutes/hotel")
const VerifyRoutes = require("./Routes/AuthRoutes/verification")
const RoomTypeRoutes = require('./Routes/HotelRoutes/roomType')
const AmenitiesRoutes = require('./Routes/HotelRoutes/amenities')
// database
require('./config/connection')
const app = express()

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://www.hoteliorooms.com');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

// app.use(cors({
//     origin: [
//         "https://admin.hoteliorooms.com",
//         "https://www.hoteliorooms.com",
//         "https://hotelio-dashboard-trickle.netlify.app",
//         "https://hotelio-rooms.netlify.app",
//         "http://localhost:3000",
//         "http://localhost:3001",
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
app.use('/roomtype', RoomTypeRoutes);
app.use('/amenity', AmenitiesRoutes);










app.get("/", (req, res) => {
    res.send("Welcome to Hotelio Backend")
})


// server startt
app.listen(port, () => {
    console.log(`server started at port ${port}`)
})
