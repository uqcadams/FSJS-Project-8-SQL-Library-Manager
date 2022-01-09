var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var booksRouter = require("./routes/books");

var app = express();

// TESTING DB CONNECTION
// Database
const { sequelize } = require("./models/index");
// Test DB
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
// Changed from false to true
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));

app.use("/", indexRouter);
app.use("/books", booksRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error();
  err.status = 404;
  err.message = "Page Not Found";
  res.render("page-not-found", { err });
});

// error handler
app.use(function (err, req, res, next) {
  err.status = err.status || 500;
  err.message = err.message || "There has been an error!";
  console.log("Error Status: ", err.status);
  console.log("Error Message: ", err.message);
  res.render("error", { err });
});

module.exports = app;
