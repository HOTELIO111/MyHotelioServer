const { searchFlights, getFareRules, getFareQuote } = require("../../Controllers/flightController/flightController.js");

const router = require("express").Router();

router.get("/search", searchFlights);
router.get("/fare-rules", getFareRules);
router.get("/fare-quote", getFareQuote);

module.exports = router;