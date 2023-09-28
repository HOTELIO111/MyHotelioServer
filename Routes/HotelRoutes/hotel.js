const {
  RegisterHotel,
  GetAllHotel,
  GetSingleHotel,
  UpdateHotelData,
  DeleteAllHotel,
  GetUsersHotel,
  fitlerDataCreate,
  GetSearchTheHotelList,
  GetFieldList,
  pagination,
  DeleteSelectedVendorHotel,
  DeleteSigleHotel,
} = require("../../Controllers/HotelControllers/hotelControllers");
const {
  UpdateRoomData,
  AddRoomType,
  GetAllRoomOfSingleHotel,
  DeleteRoomDataFromHotel,
} = require("../../Controllers/HotelControllers/roomManagementControllers");
const router = require("express").Router();

// add the hotel
router.post("/register/:id", RegisterHotel);
// get all the hotel
router.get("/getallhotel", GetAllHotel);

router.get("/getusershotel/:id", GetUsersHotel);
// get single Hotel Details
router.get("/hoteldetails/:id", GetSingleHotel);
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

// pagination check
router.get("/page", pagination);

// rooms APi
// room added
router.post("/room/add/:hotelid", AddRoomType);
// update the room data
router.post("/room/update/:hotelid/:roomid", UpdateRoomData);

// get all rooms typee of a single hotel by hotel id
router.get("/room/getall/:hotelid", GetAllRoomOfSingleHotel);

// delete the hotel rooom
router.get("/room/delete/:hotelid/:roomid", DeleteRoomDataFromHotel);

// new filter api
router.get("/filter", fitlerDataCreate);
router.get("/search", GetSearchTheHotelList);

module.exports = router;
