var express = require('express');
var router = express.Router();
var auth = require("../controllers/mainController.js");

// restrict index for logged in user only
router.get('/', auth.home);
// route to register page
router.get('/register', auth.register);
// route for register action
router.post('/register', auth.doRegister);
// route to login page
router.get('/login', auth.login);
// route for login action
router.post('/login', auth.doLogin);
// route for logout action
router.get('/logout', auth.logout);
// route for create a post page
router.get('/createpage', auth.restrictor, auth.createPage);
// route for create a post action
router.post('/createpage', auth.restrictor, auth.createPost);
// route for a post page
router.get('/posts/:id', auth.postPage);
// route for a user page
router.get('/userpage', auth.userPage);
// route for an author page
router.get('/users/:id', auth.authorPage);
//post route for create a comment action
//router.post('/createcomment', auth.restrictor, auth.createComment);
router.post('/posts/:id', auth.restrictor, auth.createComment);

module.exports = router;