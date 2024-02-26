const {
  FetchtheCustomerWallets,
  TopupWalletAmountOfCustomer,
} = require("../Controllers/walletManagement/walletControllers");

const router = require("express").Router();

router.get("/get-customer-wallet", FetchtheCustomerWallets);
router.get("/topup/wallet/:customerid", TopupWalletAmountOfCustomer);
module.exports = router;
