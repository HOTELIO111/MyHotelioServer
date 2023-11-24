const {
  createPopularLocation,
  UpdatePopularLocation,
  DeleteThePopularLocation,
  GetPopularLocationsByID,
  GetAllthePopularLocation,
} = require("../Controllers/PopularLocationsControllers");

const router = require("express").Router();

router.post("/create", createPopularLocation);
router.patch("/update/:id", UpdatePopularLocation);
router.delete("/delete/:id", DeleteThePopularLocation);
router.get("/get/:id", GetPopularLocationsByID);
router.get("/getall", GetAllthePopularLocation);

module.exports = router;
