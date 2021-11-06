var express = require('express');
var router = express.Router();
const { userList, userRegister, userLogin } = require('../controllers/user.controller');


/* GET users listing. */
router.get('/', userList);
router.post('/register', userRegister)
router.post('/login', userLogin)

module.exports = router;
