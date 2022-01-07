var express = require('express');
const { getNotification, setNotification } = require('../controllers/notification.controller');
var router = express.Router();
const {middleware} = require('../middlewares/jwt.middleware')

router.use(middleware)
router.get('/', getNotification);
router.post('/:notificationId', setNotification);

module.exports = router;