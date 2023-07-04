const { RegisterHotel, GetAllHotel, GetSingleHotel, UpdateHotelData, DeleteSingleHotel, DeleteAllHotelData } = require('../../Controllers/HotelControllers/HotelCurdControllers');
const router = require('express').Router();

// add the hotel 
router.post("/register/:id", RegisterHotel);
// get all the hotel
router.get("/getallhotel ", GetAllHotel);
// get single Hotel Details 
router.get("/hoteldetails/:id", GetSingleHotel);
// update the hotel data
router.patch("/updatedetails/:id", UpdateHotelData);
// delete Single Hotel data
router.get("/deletesingle/:id", DeleteSingleHotel);
// delelte all the data 
router.get("/deleteall", DeleteAllHotelData);





// universal search Api 





module.exports = router;