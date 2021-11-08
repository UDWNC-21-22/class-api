var express = require('express');
const { teacherInfo } = require('../controllers/teacher.controller');
const { Middleware } = require('../middlewares/jwt.middleware');
var router = express.Router();


// Not Permission
router.get('/test', function (req, res) {
    return res.send(true)
})

// Permission of user must is "teacher"
router.use(async (req, res, next) => await new Middleware(req, res, next).permission('teacher'))
router.get('/:id', teacherInfo);





module.exports = router;
