require("dotenv").config();

const Gateway = () => {
  let accessKey;
  let workingKey;
  let merchant_id;
  if (process.env.ENV === "production") {
    accessKey = process.env.SERVER_HOTELIOROOMS_ACCESSKEY;
    workingKey = process.env.SERVER_HOTELIOROOMS_WORKINGKEY;
    merchant_id = "2779245";
  } else {
    accessKey = process.env.LOCAL_3001_ACCESSKEY;
    workingKey = process.env.LOCAL_3001_WORKINGKEY;
    merchant_id = "2779245";
  }
  return { accessKey, workingKey, merchant_id };
};

module.exports = { Gateway };
