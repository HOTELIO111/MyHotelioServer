const { RegisterHotel, GetAllHotel, GetSingleHotel, UpdateHotelData, DeleteSingleHotel, DeleteAllHotelData, FilterTheHotelData, ReqHotelData, GetUsersHotel, fitlerDataCreate, GetSearchTheHotelList, GetFieldList, pagination, DeleteSelectedVendorHotel, DeleteSigleHotel } = require('../../Controllers/HotelControllers/hotelControllers');
const router = require('express').Router();

// add the hotel 
router.post("/register/:id", RegisterHotel);
// get all the hotel
router.get("/getallhotel", GetAllHotel);

router.get("/getusershotel/:id", GetUsersHotel)
// get single Hotel Details 
router.get("/hoteldetails/:id", GetSingleHotel);
// get the all hotels of the user 
// update the hotel data
router.patch("/updatedetails/:id", UpdateHotelData);
// delete Single Hotel DeleteSigleHotel
router.get("/deletesingle", DeleteSigleHotel);
// delelte all the data 
router.get("/deleteall", DeleteAllHotelData);
// delete all hotels of a vendor 
router.delete("/deletebyvendor/:id", DeleteSelectedVendorHotel)


// Get all the city 
router.get("/get/:field", GetFieldList)

// pagination check 
router.get("/page", pagination)





// universal search Api 

// router.get("/search/:data", ReqHotelData);
// router.get("/filter", FilterTheHotelData);


// new filter api
router.get("/filter", fitlerDataCreate)
router.get('/search', GetSearchTheHotelList);





module.exports = router;