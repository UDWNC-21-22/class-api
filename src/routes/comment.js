var express = require('express');
const { postComment, getComment } = require('../controllers/comment.controller');
var router = express.Router();
const {middleware} = require('../middlewares/jwt.middleware')

router.get('/:classId/:assignmentId/getComment/:studentId', getComment);
router.use(middleware)
router.post('/:classId/:assignmentId/postComment', postComment);


module.exports = router;