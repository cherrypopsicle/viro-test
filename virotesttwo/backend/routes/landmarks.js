const Router = require("express").Router;
const mongodb = require("mongodb");
const db = require("../db");
const ObjectId = mongodb.ObjectID;
const Decimal128 = mongodb.Decimal128;

const router = Router();

// Get list of landmarks
router.get("/", (req, res, next) => {
  const landmarks = [];
  console.log("landmarks found");
  db.getDb()
    .db()
    .collection("landmarks")
    .find()
    // .sort({price: -1})
    // .skip((queryPage - 1) * pageSize)
    // .limit(pageSize)
    .forEach(landmark => {
      landmarks.push(landmark);
    })
    .then(result => {
      res.status(200).json(landmarks);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json({ message: "An error has occured" });
    });
});

module.exports = router;
