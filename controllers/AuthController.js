var mongoose = require("mongoose");
var passport = require("passport");
const { check, validationResult } = require('express-validator');

var User = require("../models/User");

var userController = {};

// Restrict access to root page
userController.home = function(req, res) {
 //     if (req.session.userid){console.log(req.session.userid);}
   //   console.log(req.session);
        //console.log(req.body.username+" " + req.body.password);
  //          console.log(req.user);
  let mes1="";
  if (!req.user){mes1="User unauthenticated";}
  if (req.user){
    mes1=`Hello, user ${req.user.username}. Your session ID is ${req.sessionID} and your session expires in ${(req.session.cookie.maxAge/1000/60).toFixed(0)} minutes.`;
  }
  return res.render('index', {  title : "Authentication example", user : req.user , mes: mes1});
};

// Go to registration page
userController.register = function(req, res) {
  return res.render('register', { title : "Registration page" });
};

// Post registration
userController.doRegister = [ 
check('name').trim().isLength({ min: 2 }).withMessage('Name Must Be at Least 2 Characters').escape(),
check('username').trim().isLength({ min: 2 }).withMessage('Username Must Be at Least 2 Characters').escape(),
check('password').trim().isLength({ min: 2 }).withMessage('Password Must Be at Least 2 Characters').escape(),
function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
    return res.render('register', {title: "Registration page", name: req.body.name, username : req.body.username, password: req.body.password, errors: errors.array()});
  }else{
  User.register(new User({username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
    if (err) {
      console.log("error = " +err);
      if(err="UserExistsError: A user with the given username is already registered"){
        return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, password: req.body.password, user : user , err: "A user with the given username is already registered"})
      }else{
        return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, password: req.body.password, user : user , err: err});
      }
    }else{
//    I used passport.authenticate to generate a middleware function and then passed req, res and next to it  
      passport.authenticate('local', {}, function (err, user, info) {
       if (err) {
         return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, password: req.body.password, user : user , err: err});
      } else {
//      console.log(`info ${info}`);
        req.login(user, function (err) {
          console.log(`registered ${user.name}`);
//        console.log(req.body.username+" " + req.body.password);
//        retirection to were user wanted to  go
          let redirectTo = req.session.redirectTo || '/';
          delete req.session.redirectTo;
          return res.redirect(redirectTo);
        });
      }
      })(req, res, next);
    }
  })}
}
]
/*
 //it works too
    passport.authenticate('local')(req, res, function () {
      // console.log(`logined ${user.name}`);
      // console.log(req.body.username+" " + req.body.password);
      return res.redirect('/');
    });
*/
/*  
 //it works too
passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
})(req, res, next)
*/
// Go to login page
userController.login = function(req, res, next) {
  res.render('login', { title : "Login page", });
}

// Post login based on https://stackoverflow.com/questions/13335881/redirecting-to-previous-page-after-authentication-in-node-js-using-passport-js
userController.doLogin = [ 
//function(req, res) {  passport.authenticate('local')(req, res, function () { res.redirect('/');})} //<-work
check('username').trim().isLength({ min: 2 }).withMessage('Enter valid username').escape(),
check('password').trim().isLength({ min: 2 }).withMessage('Enter valid password').escape(),
function(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
    return res.render('login', {title: "Login page", username: req.body.username, password: req.body.password, errors: errors.array()});
  }else{
//I used passport.authenticate to generate a middleware function and then passed req, res and next to it     
  passport.authenticate('local', {}, function (err, user, info) { 
    if (!user) {
//    console.log("info "+info)
      User.findOne({ username: req.body.username }, function (err, person) {
//      console.log("err " + err + "person = " +person);
        let tx = "We don't have a user with this username";
        if (person ){tx = "You entered a wrong password";}
//      console.log("text " + tx );
        return res.render('login', {title: "Login page", username: req.body.username, password: req.body.password, err: tx});
      })
      //return res.render('login', {title: "Authentication example", username: req.body.username, password: req.body.password, err: "Combination of login and password is incorect "}); 
    }else{
      req.login(user, function (err) {
              if (err) {
//              console.log("went here 1" );
                return res.render('login' , {title: "Login page", username: req.body.username, password: req.body.password, err: err}); 
              } else {
                console.log(`logined ${user.name}`);
   //           console.log(req.body.username+" " + req.body.password);
//              next(); // works
//              retirection to were user wanted to  go
                let redirectTo = req.session.redirectTo || '/';
                delete req.session.redirectTo;
                return res.redirect(redirectTo);
              }
      })
    }
  })(req, res, next)
  // })(req, res, next())  //works
  }
},
 //it's that next() that can be called in a middleware function
function(req, res){  console.log("logined "+req.body.username+" with pas " + req.body.password);}
]
/*
  // lower function worked too
function(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
    return res.render('login', {title: "Authentication example", username: req.body.username, password: req.body.password, errors: errors.array()});
  }
  passport.authenticate('local', {}, function (err, user, info) { 
    if (!user) {
      return res.render('login', {title: "Authentication example", username: req.body.username, password: req.body.password, err: "Combination of login and password is incorect"});      
    }
    req.login(user, function (err) {
              if (err) {
                 return res.render('login' , {title: "Authentication example", username: req.body.username, password: req.body.password, err: err}); 
              } else {
              //retirection to were user wanted to  go
                console.log(`logined ${user.name}`);
   //           console.log(req.body.username+" " + req.body.password);
    //              next(); // works
                let redirectTo = req.session.redirectTo || '/';
                delete req.session.redirectTo;
                return res.redirect(redirectTo);
              }
    });
  })(req, res, next)
  // })(req, res, next())  //works
 }
*/

// logout
userController.logout = function(req, res) {
  console.log("logout");
  req.logout();
  return res.redirect('/');
}

/*
restricting access function
https://stackoverflow.com/questions/13335881/redirecting-to-previous-page-after-authentication-in-node-js-using-passport-js
*/
userController.restrictor = function(req, res, next){
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl; 
        return res.redirect('/login');
    } else {
        return next();
    }
}

//if (req.session.user) works too
/*
//it works too:
const connectEnsureLogin = require('connect-ensure-login');
userController.restrict = connectEnsureLogin.ensureLoggedIn();
*/
/*
//it works too:
userController.restrict = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
*/

userController.restricted = function(req, res) {
  return res.render('restricted', { title : "Restricted access page" , name : req.user.name, user : req.user});
}

module.exports = userController;