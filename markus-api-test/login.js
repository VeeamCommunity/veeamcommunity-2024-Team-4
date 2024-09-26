var https = require('follow-redirects').https;
var fs = require('fs');

var qs = require('querystring');

const dotenv = require('dotenv');

var options = {
  'method': 'POST',
  'hostname': 'vspc.southafricanorth.cloudapp.azure.com',
  'port': 1280,
  'path': '/api/v3/token',
  'headers': {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  'maxRedirects': 20
};

dotenv.config();
var password = process.env.password;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = qs.stringify({
  'grant_type': 'password',
  'username': 'VSPC\\veeam',
  'password': password
});

req.write(postData);

req.end();