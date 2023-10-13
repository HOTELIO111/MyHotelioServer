const {
  RegisterAgent,
  AgentLogin,
} = require("../../Controllers/AgentControllers/authControllers");

const router = require("express").Router();

// signup route
router.post("/signup", RegisterAgent);
router.get("/login", AgentLogin);

module.exports = router;
