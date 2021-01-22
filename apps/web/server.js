const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const { env } = require("process");

const nodeEnv = process.env.NODE_ENV || "development";
console.log(`nodeEnv: ${nodeEnv}`);

var forceSSL = function(req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(["https://", req.get("Host"), req.url].join(""));
  }
  return next();
};

const app = express();

if (nodeEnv !== "development") {
  console.log(`env: ${JSON.stringify(env)}`);
  app.use(forceSSL);
}

//here we are configuring dist to serve app files
app.use("/", serveStatic(path.join(__dirname, "/../../pages")));

// this * route is to serve project on different page routes except root `/`
app.get(/.*/, function(req, res) {
  res.sendFile(path.join(__dirname, "/../../pages/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port);
console.log(`app is listening on port: ${port}`);
