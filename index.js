const express = require("express");
require("dotenv").config();
const cors = require("cors");
const Utils = require("./Routes/utils");
const CustomerRoutes = require("./Routes/AuthRoutes/auth");
const HotelRoutes = require("./Routes/HotelRoutes/hotel");
const VerifyRoutes = require("./Routes/AuthRoutes/verification");
const RoomTypeRoutes = require("./Routes/HotelRoutes/roomType");
const AmenitiesRoutes = require("./Routes/HotelRoutes/amenities");
const AdminRoutes = require("./Routes/admin/adminRoutes");
const FacilitiesRoutes = require("./Routes/HotelRoutes/facilitiesRoutes");
const kycRoutes = require("./Routes/HotelRoutes/kycroutes");
const PropertyCateRoutes = require("./Routes/HotelRoutes/propertyTypesRoutes");
const NotificationRoutes = require("./Routes/notifications/notificationsRoutes");
const MultiTableRoutes = require("./Routes/multiTableDataApi");
const AgentRouters = require("./Routes/Agentroutes/index");
const StripeGateway = require("./Routes/stripe");
// database
require("./config/connection");
const app = express();

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

app.use(cors());

// some middlewares
app.use(express.json());

// variable Define
const port = process.env.PORT || 8080;
app.use(express.static("./static"));

// routes
app.use("/util", Utils);
app.use("/api", CustomerRoutes);
app.use("/api", StripeGateway);
app.use("/api/agent", AgentRouters);
app.use("/hotel", HotelRoutes);
app.use("/admin", AdminRoutes);
// verfication related apis
app.use("/verify", VerifyRoutes);
app.use("/roomtype", RoomTypeRoutes);
app.use("/amenity", AmenitiesRoutes);
app.use("/facility", FacilitiesRoutes);
app.use("/property-type", PropertyCateRoutes);
app.use("/kyc", kycRoutes);
app.use("/notify", NotificationRoutes);
app.use("/api", MultiTableRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Hotelio Backend");
});

// server startt
app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
