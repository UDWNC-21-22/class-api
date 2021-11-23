var express = require('express');
var router = express.Router();
const {
    postGrade,
    getGradeByClass,
    getGradeByUser
} = require('../controllers/grade.controller');
const {middleware} = require('../middlewares/jwt.middleware')

/* GET users listing. */
router.use(middleware)
router.post('/post', postGrade)
//router.get('/:id', getGradeByClass)
router.get('/', getGradeByUser)


module.exports = router;
