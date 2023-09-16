const { GetTheHotelResource } = require('../Controllers/multiTableDataContorllers');

const router = require('express').Router();



router.get("/get/hotel/sub-base", GetTheHotelResource)








module.exports = router