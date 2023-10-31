const router = require("express").Router();
const ccavRequestHandler = require("../Controllers/Ccavenue/ccavRequestHandler");
const ccavResponseHandler = require("../Controllers/Ccavenue/ccavResponseHandler");

router.post("/ccavRequestHandler", ccavRequestHandler);
router.post("/ccavResponseHandler", ccavResponseHandler);

module.exports = router;
