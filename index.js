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
const GoogleRoutes = require("./Routes/MiscellaneousRoutes/GoogleRoutes");
const CCAvenue = require("./Routes/CcAvenue");
const port = process.env.PORT || 8080;
// database
require("./config/connection");
const app = express();

// app.use(
//   cors({
//     origin: [
//       "https://admin.hoteliorooms.com",
//       "https://www.hoteliorooms.com",
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://localhost:3002",
//     ],
//   })
// );

app.use(cors());

// some middlewares
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://admin.hoteliorooms.com",
      "https://www.hoteliorooms.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
  })
);

// app.use(cors());

// some middlewares

// variable Define
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
app.use("/google", GoogleRoutes);
app.use("/amenity", AmenitiesRoutes);
app.use("/facility", FacilitiesRoutes);
app.use("/property-type", PropertyCateRoutes);
app.use("/kyc", kycRoutes);
app.use("/notify", NotificationRoutes);
app.use("/api", MultiTableRoutes);
app.use("/ccav", CCAvenue);

app.get("/", (req, res) => {
  res.send("Welcome to Hotelio Backend");
});

// server startt
app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
