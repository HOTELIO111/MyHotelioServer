const WalletSystem = require("./walletSystem");

const FetchtheCustomerWallets = async (req, res) => {
  try {
    const response = await WalletSystem.GetAllCustomersWallet();
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const TopupWalletAmountOfCustomer = async (req, res) => {
  const { customerid } = req.params;
  const { amount, expire } = req.query;
  try {
    const response = await WalletSystem.TopupCustomerWallet({
      customerid: customerid,
      topupAmount: amount,
      validity: expire,
    });
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = { FetchtheCustomerWallets ,TopupWalletAmountOfCustomer };
