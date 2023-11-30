const router = require("express").Router();
const ccavRequestHandler = require("../Controllers/Ccavenue/ccavRequestHandler");
const ccavResponseHandler = require("../Controllers/Ccavenue/ccavResponseHandler");

router.post("/ccavRequestHandler", ccavRequestHandler.postReq);
router.post("/ccavResponseHandler", ccavResponseHandler.postRes);

module.exports = router;
