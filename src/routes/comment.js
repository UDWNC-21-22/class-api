var express = require('express');
const { postComment, getComment } = require('../controllers/comment.controller');
var router = express.Router();
const {middleware} = require('../middlewares/jwt.middleware')


router.use(middleware)
router.post('/:classId/:assignmentId/postComment', postComment);
router.get('/:classId/:assignmentId/getComment/:studentId', getComment);


module.exports = router;