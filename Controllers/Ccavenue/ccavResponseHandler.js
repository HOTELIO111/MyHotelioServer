const http = require("http");
const fs = require("fs");
const ccav = require("./ccavutils");
const qs = require("querystring");

module.exports = (request, response) => {
  let ccavEncResponse = "";
  let ccavResponse = "";
  const workingKey = "D946555C26954295EFAB0BF6151B8270"; // Put in the 32-Bit key shared by CCAvenues.
  let ccavPOST = "";

  request.on("data", function (data) {
    ccavEncResponse += data;
    ccavPOST = qs.parse(ccavEncResponse);
    const encryption = ccavPOST.encResp;
    ccavResponse = ccav.decrypt(encryption, workingKey);
  });

  request.on("end", function () {
    let pData = "<table border=1 cellspacing=2 cellpadding=2><tr><td>";
    pData += ccavResponse.replace(/=/gi, "</td><td>");
    pData = pData.replace(/&/gi, "</td></tr><tr><td>");
    pData += "</td></tr></table>";

    const htmlCode = `
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <title>Response Handler</title>
        </head>
        <body>
          <center>
            <font size="4" color="blue"><b>Response Page</b></font>
            <br>
            ${pData}
          </center>
          <br>
        </body>
      </html>
    `;

    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write(htmlCode);
    response.end();
  });
};
