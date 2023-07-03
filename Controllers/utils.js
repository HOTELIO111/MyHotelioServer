
// Function to check if the provided input is an email
const isEmail = (input) => {
    // Email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(input);
}

// Function to check if the provided input is a mobile number
const isMobileNumber = (input) => {
    // Mobile number regex pattern
    const mobileRegex = /^\d{10}$/; // Assumes a 10-digit mobile number

    return mobileRegex.test(input);
}

module.exports = { isEmail, isMobileNumber }