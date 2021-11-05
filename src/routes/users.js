var express = require('express');
var router = express.Router();
const { userList, userRegister } = require('../controllers/user.controller');


/* GET users listing. */
router.get('/', userList);
router.post('/register', userRegister)

module.exports = router;
