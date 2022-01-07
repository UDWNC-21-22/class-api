var express = require('express');
const { postReview, getReview, markAsDone } = require('../controllers/review.controller');
var router = express.Router();
const {middleware} = require('../middlewares/jwt.middleware')


router.use(middleware)
router.post('/:classId/:assignmentId/postReview', postReview)
router.get('/:classId/:studentId/getReview', getReview)
router.post('/:reviewId', markAsDone)

module.exports = router;