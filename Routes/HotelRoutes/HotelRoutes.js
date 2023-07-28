const { RegisterHotel, GetAllHotel, GetSingleHotel, UpdateHotelData, DeleteSingleHotel, DeleteAllHotelData, FilterTheHotelData, ReqHotelData, GetUsersHotel, fitlerDataCreate, GetSearchTheHotelList, GetFieldList } = require('../../Controllers/HotelControllers/HotelCurdControllers');
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
// delete Single Hotel data
router.get("/deletesingle/:id", DeleteSingleHotel);
// delelte all the data 
router.get("/deleteall", DeleteAllHotelData);

// Get all the city name where we have hotel 
router.get("/get/:field", GetFieldList)





// universal search Api 

// router.get("/search/:data", ReqHotelData);
// router.get("/filter", FilterTheHotelData);


// new filter api
router.get("/filter", fitlerDataCreate)
router.get('/search', GetSearchTheHotelList);





module.exports = router;