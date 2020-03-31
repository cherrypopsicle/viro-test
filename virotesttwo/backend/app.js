// 3rd party imports
const express = require("express");
const bodyParser = require("body-parser");

// backend imports
const db = require("./db");
const landmarkRoutes = require("./routes/landmarks");
const app = express();

app.use(bodyParser.json());

// set cors headers so that any app can communicate with this backend.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/landmarks", landmarkRoutes);

db.initDb((err, db) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(3100);
    }
})
