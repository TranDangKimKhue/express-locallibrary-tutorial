var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require("./routes/catalog");

const compression = require("compression");
const helmet = require("helmet");

var app = express();

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

// Add helmet to the middleware chain.
// Set CSP headers to allow our Bootstrap and Jquery to be served
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://khue150397:123AHQ@cluster0.imxebfq.mongodb.net/?retryWrites=true&w=majority";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// const Schema = mongoose.Schema;

// const SomeModelSchema = new Schema({
//   a_string: String,
//   a_date: Date,
// });

// const schema = new Schema({
//   name: String,
//   binary: Buffer,
//   living: Boolean,
//   updated: { type: Date, default: Date.now() },
//   age: { type: Number, min: 18, max: 65, required: true },
//   mixed: Schema.Types.Mixed,
//   _someId: Schema.Types.ObjectId,
//   array: [],
//   ofString: [String], // You can also have an array of each of the other types too.
//   nested: { stuff: { type: String, lowercase: true, trim: true } },
// });

// const breakfastSchema = new Schema({
//   eggs: {
//     type: Number,
//     min: [6, "Too few eggs"],
//     max: 12,
//     required: [true, "Why no eggs?"],
//   },
//   drink: {
//     type: String,
//     enum: ["Coffee", "Tea", "Water"],
//   },
// });

// const yourSchema = new Schema({
//   sport: String,
//   age: Number,
// });

// const SomeModel = mongoose.model("SomeModel", SomeModelSchema);

// // Create an instance of model SomeModel
// const awesome_instance = new SomeModel({ name: "awesome" });

// // Save the new model instance asynchronously
// await awesome_instance.save();
// await SomeModel.create({ name: "also_awesome" });

// const Athlete = mongoose.model("Athlete", yourSchema);

// // find all athletes who play tennis, selecting the 'name' and 'age' fields
// const tennisPlayers = await Athlete.find(
//   { sport: "Tennis" },
//   "name age"
// ).exec();

// console.log(awesome_instance.name); //should log 'also_awesome'

// // Change record by modifying the fields, then calling save().
// awesome_instance.name = "New cool name";
// await awesome_instance.save();

// // Create a SomeModel model just by requiring the module
// const SomeModel = require("../models/somemodel");

// // Use the SomeModel object (model) to find all SomeModel records
// const modelInstances = await SomeModel.find().exec();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
