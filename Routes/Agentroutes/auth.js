const {
  RegisterAgent,
  AgentLogin,
  ForgotPasswordAgent,
  ResetPassword,
} = require("../../Controllers/AgentControllers/authControllers");

const router = require("express").Router();

// signup route
router.post("/signup", RegisterAgent);
router.get("/login", AgentLogin);
router.get("/forgot-password/:email", ForgotPasswordAgent);
router.get("/reset-password", ResetPassword);

module.exports = router;
