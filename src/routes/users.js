var express = require('express');
var router = express.Router();
const { userList, userRegister, userLogin, authenticate} = require('../controllers/user.controller');


/* GET users listing. */
router.get('/', userList);
router.post('/register', userRegister)
router.post('/login', userLogin)
router.get('/authenticate', authenticate)



module.exports = router;
