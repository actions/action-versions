const https = require("https");
const fs = require("fs");
const assert = require("assert");

/**
 * Performs a get request
 * @param {string} url
 * @returns {Promise}
 */
async function get(url) {
  assert.ok(url, "Arg 'url' must not be empty");
  var options = {
    method: "GET",
    headers: {
      "User-Agent": "node/" + process.version,
    },
  };
  var promise = new Promise((resolve, reject) => {
    var req = https.request(url, options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        resolve(body);
      });
      res.on("error", function (error) {
        reject(error);
      });
    });
    req.end();
  });

  return promise;
}
exports.get = get;
