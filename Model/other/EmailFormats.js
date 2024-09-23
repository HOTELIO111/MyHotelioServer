const emailFormat = (Code) => {
  return `<p>
    Hello , Welcome to Hotelio,
  </p>
  
  <p>
    Thank you for signing up with our platform. To verify your email address and activate your account, please use the following verification code:
  </p>
  
  <p style="font-size: 18px; font-weight: bold;">
    Verification Code: <span style="font-size: 24px;">${Code}</span>
  </p>
  
  <p>
    Please copy and paste this code into the appropriate field on our website or app. This code is valid for <b>5 Min </b> from the time of this email. If you do not verify your email within the specified time, you may need to request a new verification code.
  </p>
  
  <p>
    If you did not sign up for an account on our platform, please disregard this email.
  </p>
  
  <p>
    If you have any questions or need further assistance, please do not hesitate to contact our support team at +91 (811) 5510050.
  </p>
  
  <p>
    Thank you for choosing our platform!
  </p>
  
  <p>
    Best regards,
    <br>
    Hotelio India
  </p>
`;
};

const EmailForResetLink = (senderName, resetLink) => {
  return ` <h3>Hotelio - Password Reset</h3>
  <p>Dear ${senderName},</p>
  <p>We have received a password reset request for your Hotelio account. To reset your password, click the button below:</p>
  <a href="${resetLink}">
    <button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; text-decoration: none; cursor: pointer;">Reset Password</button>
  </a>
  <p>If the button above does not work, you can copy and paste the following URL into your web browser:</p>
  <p>${resetLink}</p>
  <p>Please note that this reset link is valid for <b>5 Min</b>. After that, you will need to request a new reset link if you still require assistance.</p>
  <p>If you did not initiate this password reset request, please ignore this email. Your account remains secure, and no changes have been made.</p>
  <p>If you have any further questions or require additional assistance, please don't hesitate to contact our support team at hotelio@gmail.com.</p>`;
};

const EmailForOTP = (senderName, otp) => {
  return `
    <h3>Hotelio - OTP Verification</h3>
    <p>Dear ${senderName},</p>
    <p>We have received a request to verify your account for your Hotelio account. Please use the following OTP to complete your verification:</p>
    <h2 style="color: #4CAF50;">${otp}</h2>
    <p>Please note that this OTP is valid for <b>10 minutes</b>. After that, you will need to request a new OTP if you still require assistance.</p>
    <p>If you did not initiate this request, please ignore this email. Your account remains secure, and no changes have been made.</p>
    <p>If you have any further questions or require additional assistance, please don't hesitate to contact our support team at hotelio@gmail.com.</p>
  `;
};

module.exports = EmailForOTP;

const Contactus = ({ name, email }) => {
  return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Add any desired CSS styling here */
    </style>
  </head>
  <body>
    <h1>New Inquiry Notification</h1>
    <p>Hello,</p>
    <p>A new inquiry has been submitted through the contact form:</p>
    
    <h2>Inquiry From :</h2>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
    </ul>
    
    <p>Please respond promptly to address the inquiry.</p>
    
    <p>Best regards,</p>
    <p>Hotelio Rooms</p>
  </body>
  </html>
  `;
};

module.exports = { emailFormat, EmailForResetLink, Contactus, EmailForOTP };
