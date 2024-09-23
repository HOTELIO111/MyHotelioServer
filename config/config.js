require("dotenv").config();

const Gateway = () => {
  let accessKey;
  let workingKey;
  let merchant_id;
  if (process.env.ENV === "production") {
    accessKey = process.env.SERVER_HOTELIOROOMS_ACCESSKEY;
    workingKey = process.env.SERVER_HOTELIOROOMS_WORKINGKEY;
    merchant_id = "asdasdasd";
  } else {
    accessKey = process.env.LOCAL_3001_ACCESSKEY;
    workingKey = process.env.LOCAL_3001_WORKINGKEY;
    merchant_id = "asdasdasd";
  }
  return { accessKey, workingKey };
};

module.exports = { Gateway };
