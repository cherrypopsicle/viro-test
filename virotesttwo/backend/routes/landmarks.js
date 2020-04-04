const Router = require("express").Router;
const mongodb = require("mongodb");
const db = require("../db");
const ObjectId = mongodb.ObjectID;
const Decimal128 = mongodb.Decimal128;

const router = Router();

router.get("/", (req, res, next) => {
  const markers = [];
  db.getDb()
    .db()
    .collection("markers")
    .find()
    // .sort({price: -1})
    // .skip((queryPage - 1) * pageSize)
    // .limit(pageSize)
    .forEach(marker => {
      markers.push(marker);
    })
    .then(result => {
      res.status(200).json(markers);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json({ message: "An error has occured" });
    });
});

module.exports = router;
