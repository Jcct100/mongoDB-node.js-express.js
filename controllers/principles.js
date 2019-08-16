const DesignPrinciples = require("../models/principles");

module.exports = {
  index: (req, res, next) => {
    DesignPrinciples.find({})
      .then(principles => {
        res
          .status(200)
          .json(principles[Math.floor(Math.random() * principles.length)]);
      })
      .catch(err => {
        next(err);
      });
  }
};
