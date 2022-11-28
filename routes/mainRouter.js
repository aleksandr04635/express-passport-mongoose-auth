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
// route for create page
router.get('/createpage', auth.restrictor, auth.createPage);
// route for create action
router.post('/createpage', auth.restrictor, auth.createPost);

module.exports = router;