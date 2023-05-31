//var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
const session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');
const { v4: uuidv4 } = require('uuid');//id

var indexRouter = require('./routes/mainRouter.js');
//var usersRouter = require('./routes/users');

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}

mongoose.Promise = global.Promise;
let mstr1= 'mongodb://localhost/node-auth';
//var mstrPr = 'mongodb+srv://aleksandr04635:df368ie90@cluster0.vkcz0.mongodb.net/express_pug_blog?retryWrites=true&w=majority';
let mstr = process.env.MONGODB_URI || mstr1;
console.log("connecting to: "+mstr);
mongoose.connect(mstr, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(( ) => { console.log( `connection succesful to ${mstr} `);})  //, port ${process.env.PORT}
  .catch((err) => console.error(err));

/*
//mongoose.Promise = global.Promise;
mongoose.connect(mstr, { 
 // useNewUrlParser: true , useUnifiedTopology: true
});
 // .then(() =>  console.log('connection succesful'))
 // .catch((err) => console.error(err));
var db = mongoose.connection;
//db.on('connected', ()=>{console.log.bind(console, `connection succesful to ${mstr}`); console.log("fds")});
db.on('connected', ()=>{console.log(`connection succesful to ${mstr}`); console.log(process.env.MONGODB_URI2)});
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));
*/

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.set('trust proxy', 1);
let sesSec = process.env.SES_SEC || 'keyboard cat';
app.use(session({
    genid: function (req) {   return uuidv4();  },
    secret: sesSec,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mstr }),
    cookie: { 
      maxAge:  24*60*60 * 1000 
      //expires: 60000  // Session expires after 1 min of inactivity. // req.session.cookie.expires - time of exp
    }
  //  cookie: { maxAge: 60 * 60 * 1000, secure: true }//secure - only via https
}));
//app.use(cookieParser()); //really works too without a secret-?
app.use(cookieParser(sesSec));

app.use(passport.initialize());
app.use(passport.session());

//console.log(sesSec);
//app. use((req, res, next) => { const { headers: { cookie } } = req; if (cookie) { const values = cookie.split(';').reduce((res, item) => { console.log(item)})}; next();});
//app. use((req, res, next) => { const { headers: { cookie } } = req; if (cookie) { const values = cookie.split(';') ; console.log(values)}; next();});
//app. use((req, res, next) => { const { session } = req;   console.log(session); next();});

var User = require('./models/UserModel');
//passport.use(new LocalStrategy (authUser)) // without passportLocalMongoose
// ^The "authUser" is a function that we will define later will contain the steps to authenticate a user, and will return the "authenticated user".
//passport.use(new LocalStrategy(User.authenticate()));//<- with passportLocalMongoose it works too, deprecated
passport.use(User.createStrategy());//<- it works too, new    ,without passportLocalMongoose
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {        return done(null, false, { message: 'Incorrect username.' });      }
      if (!user.validPassword(password)) {        return done(null, false, { message: 'Incorrect password.' });      }
      return done(null, user);
    });
  }
));
*/
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
*/

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//passport.serializeUser( (userObj, done) => {    console.log("userobj1 "+userObj);   done(null, userObj);})  //without mongo plugin
//passport.deserializeUser((userObj, done) => {    console.log("userobj2 "+userObj);   done (null, userObj )})   //without mongo plugin
/*
printData = (req, res, next) => {
  console.log(`req.body.username -------> ${req.body.username}`) 
  console.log(`req.body.password -------> ${req.body.password}`)
  console.log(`\n req.session.passport -------> `)
  console.log(req.session.passport)
  console.log(`\n req.user -------> `) 
  console.log(req.user) 
  console.log("\n Session and Cookie")
  console.log(`req.session.id -------> ${req.session.id}`) 
  console.log(`req.session.cookie -------> `) 
  console.log(req.session.cookie) 
  next()
}
app.use(printData) //user printData function as middleware to print populated variables
*/

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error', { title : "Error", user : req.user});
});
module.exports = app;
