var crypto = require("crypto");

exports.encrypt = function (plainText, workingKey) {
  var m = crypto.createHash("md5");
  m.update(workingKey);
  var key = m.digest(); // Use the default encoding, which is 'hex' in this case
  var iv = Buffer.from("000102030405060708090a0b0c0d0e0f", "hex"); // Use Buffer to create the initialization vector
  var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  var encoded = cipher.update(plainText, "utf8", "hex");
  encoded += cipher.final("hex");
  return encoded;
};

exports.decrypt = function (encText, workingKey) {
  var m = crypto.createHash("md5");
  m.update(workingKey);
  var key = m.digest(); // Use the default encoding, which is 'hex' in this case
  var iv = Buffer.from("000102030405060708090a0b0c0d0e0f", "hex"); // Use Buffer to create the initialization vector
  var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  var decoded = decipher.update(encText, "hex", "utf8");
  decoded += decipher.final("utf8");
  return decoded;
};
