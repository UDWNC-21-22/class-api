var express = require('express');
var router = express.Router();
const {getClass, createClass, getClassByID} = require('../controllers/class.controller');
const {middleware} = require('../middlewares/jwt.middleware')

/* GET users listing. */
router.use(middleware)
router.get('/me', getClass)
router.post('/create', createClass)
router.get('/me/:id',getClassByID)

module.exports = router;
