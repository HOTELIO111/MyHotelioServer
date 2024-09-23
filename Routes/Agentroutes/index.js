const router = require("express").Router();
const AuthRoutes = require("./auth");

router.use("/auth", AuthRoutes);

module.exports = router;
