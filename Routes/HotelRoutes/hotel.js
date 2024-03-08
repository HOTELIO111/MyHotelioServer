const {
  GetSearchHotels,
  GetSearchedLocationData,
  SearchHotelApi,
} = require("../../Controllers/HotelControllers/Search");
const {
  RegisterHotel,
  GetAllHotel,
  GetSingleHotel,
  UpdateHotelData,
  DeleteAllHotel,
  GetUsersHotel,
  fitlerDataCreate,
  GetFieldList,
  DeleteSelectedVendorHotel,
  DeleteSigleHotel,
  GetSingleHotelDataNew,
  GetSearchTheHotelList,
  GetNearByHotels,
  GetHotelBookingAsperhotel,
  GetNearByHotelList,
  GetAllUnaprovedHotels,
  ApproveTheHotelByAdmin,
  ApproveAllhotelsinBulk,
} = require("../../Controllers/HotelControllers/hotelControllers");
const {
  UpdateRoomData,
  AddRoomType,
  GetAllRoomOfSingleHotel,
  DeleteRoomDataFromHotel,
  GetSingleRoomAvailibility,
} = require("../../Controllers/HotelControllers/roomManagementControllers");
const router = require("express").Router();
const BookingRoutes = require("./../booking/bookingRoutes");
const RoomConfigRoutes = require("./roomCofigRoutes");
const CreateIndexRoute = require("./../createIndex");
const HotelFilterRoutes = require("./hotelFitlerCategories");

// add the booking route
router.use("/book", BookingRoutes);
router.use("/room-confg", RoomConfigRoutes);
router.use("/room-filter", HotelFilterRoutes);
router.use("/index", CreateIndexRoute);

// add the hotel
router.post("/register/:id", RegisterHotel);
// get all the hotel
router.get("/getallhotel", GetAllHotel);

router.get("/getusershotel/:id", GetUsersHotel);
// get single Hotel Details
router.get("/hoteldetails/:id", GetSingleHotel);
// Get single Data Hotel New APi
router.get("/hotel-details/:id", GetSingleHotelDataNew);
// get the all hotels of the user
// update the hotel data
router.patch("/updatedetails/:id", UpdateHotelData);
// delete Single Hotel DeleteSigleHotel
router.get("/deletesingle", DeleteSigleHotel);

// delelte all the data
router.get("/deleteall", DeleteAllHotel);

// delete all hotels of a vendor
router.delete("/deletebyvendor/:id", DeleteSelectedVendorHotel);

// Get all the city
router.get("/get/:field", GetFieldList);

router.get("/get/near-by/hotels", GetNearByHotelList);

// Get the Hotels Bookings as per Hotels
router.get("/get/hotel-bookings/:hotelid", GetHotelBookingAsperhotel);
// Get Unapprooved hotels list
router.get("/get/unaproved-hotels/:id", GetAllUnaprovedHotels);
// get Approve or unapprove the hotel
router.get("/get/approve/:id/:status", ApproveTheHotelByAdmin);
// get approve or unapprove the hotel in bulk
router.get("/get/approve-unapprove/:status",  ApproveAllhotelsinBulk);
// -------------------------------------- rooms APi --------------------------------------------------------

// room added
router.post("/room/add/:hotelid", AddRoomType);
// update the room data
router.post("/room/update/:hotelid/:roomid", UpdateRoomData);
router.post("/room/update", UpdateRoomData);

// get all rooms typee of a single hotel by hotel id
router.get("/room/getall/:hotelid", GetAllRoomOfSingleHotel);
router.get("/room/getall", GetAllRoomOfSingleHotel);

// delete the hotel rooom
router.get("/room/delete/:hotelid/:roomid", DeleteRoomDataFromHotel);
router.get("/room/delete", DeleteRoomDataFromHotel);
router.get("/room-info/:id", GetSingleRoomAvailibility);

// new filter api
router.get("/filter", fitlerDataCreate);
router.get("/search", GetSearchTheHotelList);
router.get("/search-it", GetSearchHotels);
router.get("/search-loc", GetSearchedLocationData);

// city wise search Routes

router.get("/city-wise/search");
router.get("/search/hotels", SearchHotelApi);

module.exports = router;
