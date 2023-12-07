require("dotenv").config();

const Gateway = () => {
  let accessKey;
  let workingKey;
  if (process.env.ENV === "production") {
    accessKey = process.env.SERVER_HOTELIOROOMS_ACCESSKEY;
    workingKey = process.env.SERVER_HOTELIOROOMS_WORKINGKEY;
  } else {
    accessKey = process.env.LOCAL_3001_ACCESSKEY;
    workingKey = process.env.LOCAL_3001_WORKINGKEY;
  }
  return { accessKey, workingKey };
};

module.exports = { Gateway };
