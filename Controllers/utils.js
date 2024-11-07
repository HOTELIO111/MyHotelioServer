// Function to check if the provided input is an email
const isEmail = (input) => {
  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(input);
};

// Function to check if the provided input is a mobile number
const isMobileNumber = (input) => {
  // Mobile number regex pattern
  const mobileRegex = /^\d{10}$/; // Assumes a 10-digit mobile number

  return mobileRegex.test(input);
};

const formatMobileNumber = (mobileNumber = "") => {
  // Regular expression to check if the number is valid
  // - Allows optional country code prefixed with '+'
  // - Ensures the number is 10 digits long without the country code
  const mobilePattern = /^(\+?\d{1,3})?(\d{10})$/;

  // Trim whitespace from input
  mobileNumber = mobileNumber.trim();

  const match = mobileNumber.match(mobilePattern);

  if (match) {
    const countryCode = match[1] || "+91"; // Default to India country code if none provided
    const localNumber = match[2];

    return `${countryCode}${localNumber}`;
  } else {
    return false;
  }
};

const verifyInput = (input) => {
  if (isEmail(input)) {
    return "email";
  } else if (isMobileNumber(input)) {
    return "mobileNo";
  } else {
    return "Invalid Input";
  }
};

module.exports = { isEmail, isMobileNumber, verifyInput, formatMobileNumber };
