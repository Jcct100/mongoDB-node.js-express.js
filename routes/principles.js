const express = require("express");
const router = express.Router();

const PrinciplesController = require("../controllers/principles");

router.route("/").get(PrinciplesController.index);

module.exports = router;
