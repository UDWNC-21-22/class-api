var express = require('express');
const { userList } = require('../controllers/user.controller');
var router = express.Router();


/* GET home page. */
router.get('/', userList);



module.exports = router;
