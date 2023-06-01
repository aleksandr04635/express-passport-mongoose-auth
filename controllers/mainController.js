const http = require("http");// only for ip from req
var mongoose = require("mongoose");
var passport = require("passport");
var async = require('async');
const { check, validationResult } = require('express-validator');

var User = require("../models/UserModel.js");
var Post = require("../models/PostModel.js");

var userController = {};

//decoding of html content
//from https://stackoverflow.com/questions/44195322/a-plain-javascript-way-to-decode-html-entities-works-on-both-browsers-and-node
function decodeEntities(encodedString) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}

// renders a homepage with all posts
userController.home = function(req, res) {
 //     if (req.session.userid){console.log(req.session.userid);}
   //   console.log(req.session);
        //console.log(req.body.username+" " + req.body.password);
  //          console.log(req.user);
  let mes1="";
  if (!req.user){mes1="User unauthenticated";}
  if (req.user){
    mes1=`Hello, user ${req.user.username}. <br> Your IP is ${req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress}. <br> Your session will end in ${(req.session.cookie.maxAge/1000/60).toFixed(0)} 
       minutes even if you close and open the browser`;//.slice(7,)
  // mes1=`Hello, user ${req.user.username}. Your session ID is ${req.sessionID} and your session expires in ${(req.session.cookie.maxAge/1000/60).toFixed(0)} minutes.`;
  }
  // Find posts there field "title" exists at all
  Post.find({title: { $exists: true}} )
  //.aggregate({ $filter :{title: { $exists: true}}})
  .populate('author')
  .sort([['updatedAt', 'descending']])
  .exec(function (err, posts) {
    if (err) { return next(err); }
    //const posts1=posts.map((post)=>{return {...post, content: post.content+"A"}});
    //const posts1=posts.map((post)=>{post.content= post.content+"B";return post;});
    //const posts1=posts.map((post)=>{post.content= unescape(post.content);return post;});
    //console.log(posts[0]);
    //console.log(posts1[0]);
    //const posts1=posts.map((post)=>{post.content= decodeEntities(post.content);return post;});
    // return res.render('index', {  title : "Authentication example", user : req.user , mes: mes1, posts:posts1});
    //DECODE html
    posts.forEach((post)=>{post.content= decodeEntities(post.content);return post;});
    return res.render('index', {  title : "Authentication example", user : req.user , mes: mes1, posts:posts});
  });
   //let posts=await Post.find({});
  //return res.render('index', {  title : "Authentication example", user : req.user , mes: mes1, posts:posts});
};

// Go to registration page
userController.register = function(req, res) {
  return res.render('register', { title : "Registration page" });
};

// Post route registration
//username will be email - unique
userController.doRegister = [ 
check('name').trim().isLength({ min: 2 }).withMessage('Name Must Be at Least 2 Characters').escape(),
check('username').trim().isLength({ min: 2 }).withMessage('Username Must Be at Least 2 Characters').escape(),
check('password').trim().isLength({ min: 2 }).withMessage('Password Must Be at Least 2 Characters').escape(),
function(req, res, next) {
  const errors = validationResult(req);
  //console.log("error 1= " );
  //console.log(errors);
  if (!errors.isEmpty()) { 
    return res.render('register', {title: "Registration page", name: req.body.name, username : req.body.username,
       password: req.body.password, errors: errors.array()});
  }else{
  // registers a user...  
  User.register(new User({username : req.body.username, name: req.body.name }), req.body.password, function(err, user) {
    if (err) {
      //console.log("error 2= " +err);
      //console.log(req.body.password);
      if(err=="UserExistsError: A user with the given username is already registered"){
        return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, 
          password: req.body.password, user : user , err: "A user with the given username is already registered"})
      }else{
        return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, 
          password: req.body.password, user : user , err: err});
      }
    }else{
//    I used passport.authenticate to generate a middleware function and then passed req, res and next to it  
      //... then authenticates them...
      passport.authenticate('local', {}, function (err, user, info) {
       if (err) {
         return res.render('register', {title: "Registration page", name: req.body.name, username: req.body.username, 
          password: req.body.password, user : user , err: err});
      } else {
        //...and starts a session
        req.login(user, function (err) {
          console.log(`registered ${user.name}`);
          //console.log(req.body.username+" " + req.body.password);
          //retirection to were user wanted to  go
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

// renders a login page
userController.login = function(req, res, next) {
  let mes ="";
  if(req.session.message){
    mes = req.session.message;
    delete req.session.message;
  }
  //console.log(req.session.message);
  res.render('login', { title : "Login page", err: mes});
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
                //console.log("went here 1" );
                return res.render('login' , {title: "Login page", username: req.body.username, password: req.body.password, err: err}); 
              } else {
                console.log(`logined ${user.name} from IP ${req.socket.remoteAddress}`);
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
  console.log("logout"+req.user.name);
  req.logout();
  return res.redirect('/');
}

/*
restricting access function
https://stackoverflow.com/questions/13335881/redirecting-to-previous-page-after-authentication-in-node-js-using-passport-js
*/
//restrict access
userController.restrictor = function(req, res, next){
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl; 
        req.session.message = "You must be signed in to do it"
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

//renders create a post page
userController.createPage = function(req, res) {
  return res.render('create', { title : "Create a post - restricted access page" , name : req.user.name, user : req.user});
}

//handling of a post request to create a post
userController.createPost = [ 
  check('title').trim().isLength({ min: 2 }).withMessage('Title Must Be at Least 2 Characters').escape(),
  check('content1').trim().isLength({ min: 2 }).withMessage('Content Must Be at Least 2 Characters').escape(),
  //.escape()
  function(req, res, next) {
    const errors = validationResult(req);
    //console.log(errors);
    //console.log(errors.isEmpty());
    //console.log(req.user);
  if (!errors.isEmpty()) { 
      return res.render('create', { title : "Create a post - restricted access page" , name : req.user.name, 
      user : req.user, postTitle:req.body.title, postContent: req.body.content1, errors: errors.array()});
  }else{
    //creates a post
    let post = new Post(  { title: req.body.title, content: req.body.content1, author:req.user._id}    );
    //console.log(post);
    post.save(function (err, post) {
      console.log(post);
      if (err) { return next(err); }
      //res.redirect('/');
      //and redirects to its page
      return res.redirect(`/posts/${post._id}`);
    });
    //return res.redirect('/');
  //return res.render('create', { title : "Create a post - restricted access page" , name : req.user.name, 
   // user : req.user, postTitle:req.body.title, postContent: req.body.content1});
}}
]

//shows all post of a current user
userController.userPage = function(req, res) {
  //console.log(req.user._id);
  Post.find({ 'author': req.user._id , 'title': { $exists: true} })
  .populate('author')
  .sort([['updatedAt', 'descending']])
   .exec(function (err, posts) {
    //console.log(post);
    //console.log(err);
    if (err || !posts){  
      return res.render('user', {  title : "All your posts", user : req.user , err: "nothing is found"});
    }else{
      if ( posts.length==0) {  
        return res.render('user', {  title : "All your posts", user : req.user , err: "nothing is found"});
      }else{
        //decode html
        posts.forEach((post)=>{post.content= decodeEntities(post.content);return post;}); 
        return res.render('user', {  title : "All your posts", user : req.user , author: posts[0].author, posts:posts});
      }
    }
   });
 };

//shows all posts of an author
userController.authorPage = function(req, res) {
   Post.find({ 'author': req.params.id, 'title': { $exists: true} })
   .populate('author')
   .sort([['updatedAt', 'descending']])
   .exec(function (err, posts) {
    //console.log(posts);
    //console.log(err);
    //console.log(posts.length);
    if (err || !posts){  
      return res.render('user', {  title : "All posts of a user", user : req.user , err: "nothing is found"});
    }else{
      if ( posts.length==0) {  
        return res.render('user', {  title : "All posts of a user", user : req.user , err: "nothing is found"});
      }else{
        //!decode html
        posts.forEach((post)=>{post.content= decodeEntities(post.content);return post;});
        return res.render('user', {  title : "All posts of a user "+posts[0].author.name, user : req.user , 
          author: posts[0].author, posts:posts});
      }
    }
    /*
    if (err || posts.length==0) { 
      let tx="nothing is found";
      return res.render('user', {  title : "All posts of a user", user : req.user , err: tx});
    }
     */
   });
};

//by get querry shows a post and allows to comment it
userController.postPage = function(req, res) {
  Post.findById(req.params.id)
  .populate('author')
  .exec(function (err, post) {
    if (err || !post) { 
     return res.render('showPost', {  title : "A post", user : req.user , err: "nothing is found"});
    }
    else{
      //decode html
      post.content= decodeEntities(post.content);
      // a function to find comments to a post or a comment
      async function comsTo(id){
        try {
          //find an array of comments to a given id of a post or a comment
          let coms= await Post.find({'commentTo':id}).populate('author').sort([['updatedAt', 'descending']]);
          for (let i=0; i<coms.length; i++ ){
            //console.log(coms[i]._id);
            //decode html
            coms[i].content= decodeEntities(coms[i].content);
            //recursively call a function to find comments to a comment 
            coms[i].comments= await comsTo(coms[i]._id);
          }
          return coms;
        }
        catch(err) {
          console.log(err);
        }
      }
      //a function to find all comments to the post in DB and render them
      async function comsPr(){
        try {
           //call a function to find comments to the post
           post.comments = await comsTo(req.params.id);
           return res.render('showPost', {  title : "A post", user : req.user , post:post});
        }
        catch(err) {
          console.log(err);
        }
      }
      //call the function to find all comments in DB and render them
      comsPr();
      //console.log("Post:");  for (var pr in post){  if (post.hasOwnProperty(pr)){      console.log(pr + "  " +post[pr]);   }   }
      //return res.render('showPost', {  title : "A post", user : req.user , post:post});
    }
  });
};

//post route to create a comment
userController.createComment = [ 
check('content1').trim().isLength({ min: 3 }).withMessage('Content Must Be at Least 3 Characters'),
//.escape(),
function(req, res, next) {
    const errors = validationResult(req);
    //console.log("req.pageYOffset:");
    //console.log(req.body.pageYOffset);
  //req.body.topost passes to what post or coment a comment must be made  
  if (!errors.isEmpty()) { 
    Post.findById(req.body.topost)
    .populate('author')
    .exec(function (err, post) {
      if (err || !post) { 
       return res.render('showPost', {  title : "A post", user : req.user , err: "nothing is found"});
      }
      else{
        //decode html
        post.content= decodeEntities(post.content);
        // a function to find comments to a post or a comment
        async function comsTo(id){
          try {
            //find an array of comments to a given id of a post or a comment
            let coms= await Post.find({'commentTo':id}).populate('author').sort([['updatedAt', 'descending']]);
            for (let i=0; i<coms.length; i++ ){
              //console.log(coms[i]._id);
              //decode html
              coms[i].content= decodeEntities(coms[i].content);
              //recursively call a function to find comments to a comment 
              coms[i].comments= await comsTo(coms[i]._id);
            }
            return coms;
          }
          catch(err) {
            console.log(err);
          }
        }
        //a function to find all comments to the post in DB and render them
        async function comsPr(){
          try {
             //call a function to find comments to the post
             post.comments = await comsTo(req.params.id);
             return res.render('showPost', {  title : "A post", user : req.user , post:post,
              name : req.user.name, postContent: req.body.content1, commentedTo: req.body.commentto1, errors: errors.array()});
          }
          catch(err) {
            console.log(err);
          }
        }
        //call the function to find all comments in DB and render them
        comsPr();
      }
    });
  }else{
    //create a comment if there are no errors
    let com = new Post(  { content: req.body.content1, author:req.user._id, commentTo:req.body.commentto1}    );
    //console.log("Added comment");
    //console.log(com);
    com.save(function (err) {
      if (err) { return next(err); }
      return res.redirect(`/posts/${req.body.topost}`);
      //return res.render('showPost', { title : "A post" , name : req.user.name, user : req.user, });
    });
  //return res.render('create', { title : "Create a post - restricted access page" , name : req.user.name, 
   // user : req.user, postTitle:req.body.title, postContent: req.body.content1});
}}
]

module.exports = userController;