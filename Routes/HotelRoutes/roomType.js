const router = require('express').Router()
const {
    AddRoomType,
    DeleteRoomType,
    UpdateRoomType,
    DeleteRoomTypeAll,
    GetRoomType
} = require('../../Controllers/HotelControllers/roomTypeControllers')




// add the roomType
router.post("/add", AddRoomType);
router.get('/delete/:id', DeleteRoomType);
router.patch('/update/:id', UpdateRoomType);
router.delete('/deleteall', DeleteRoomTypeAll);
router.get("/get", GetRoomType)







module.exports = router
