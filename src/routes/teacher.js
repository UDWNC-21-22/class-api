var express = require('express');
const { teacherInfo } = require('../controllers/teacher.controller');
const { teacherMiddleware } = require('../middlewares/jwt.middleware');
var router = express.Router();


/* GET users listing. */
router.get('/', teacherMiddleware, teacherInfo);




module.exports = router;
