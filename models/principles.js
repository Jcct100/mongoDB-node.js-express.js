const mongoose = require("mongoose");

const designPrinciples = mongoose.model(
  "designPrinciples",
  mongoose.Schema({
    header: String,
    author: String,
    principles: [String]
  })
);

module.exports = designPrinciples;
