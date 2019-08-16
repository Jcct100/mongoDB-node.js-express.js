const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const app = express();
const principles = require("./routes/principles");
require("dotenv").config();

//middlewares
app.use(logger("dev"));

//routes
app.use("/principles", principles);

//catch 404 errors and forward them to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//error handler function
app.use((err, req, res, next) => {
  const error = app.get("env") === "development" ? err : {};
  const status = err.status || 500;
  //response to client
  res.status(status).json({
    error: {
      message: error.message
    }
  });

  //respond to ourselves
  console.error(err);
});

//connect to the DB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

//start the server
const port = app.get("port") || 3000;
app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
