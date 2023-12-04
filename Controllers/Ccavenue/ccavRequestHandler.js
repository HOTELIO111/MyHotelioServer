var http = require("http"),
  fs = require("fs"),
  ccav = require("./ccavutils"),
  qs = require("querystring");

exports.postReq = function (request, response) {
  var body = "",
    workingKey = "CDE0D4FF11C03155B27C77B89453E334", //Put in the 32-Bit key shared by CCAvenues.
    accessCode = "AVHR05KL37AH70RHHA", //Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  request.on("data", function (data) {
    body += data;
    encRequest = ccav.encrypt(body, workingKey);
    formbody =
      '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
      encRequest +
      '"><input type="hidden" name="access_code" id="access_code" value="' +
      accessCode +
      '"><script language="javascript">document.redirect.submit();</script></form>';
  });

  request.on("end", function () {
    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write(formbody);
    response.end();
  });
  return;
};
