const express = require("express");
const {
  createRoomConfig,
  DeletRoomConfig,
  GetAllroomConfig,
  DeleteAllRoomConfig,
  UpdateRoomConfig,
} = require("../../Controllers/HotelControllers/roomConfigControllers");
const router = express.Router();

router.post("/create/config/:hid/:rid", createRoomConfig);
router.patch("/update/:id", UpdateRoomConfig);
router.get("/get", GetAllroomConfig);
router.delete("/delete/:id", DeletRoomConfig);
router.delete("/delete", DeleteAllRoomConfig);

module.exports = router;
