var express = require('express');
var router = express.Router();
const {
    getClass, 
    createClass, 
    getClassByID, 
    updateClass,
    deleteClass,
    inviteClass,
    verifyInviteClass
} = require('../controllers/class.controller');
const {middleware} = require('../middlewares/jwt.middleware')

/* GET users listing. */
router.post('/invite/verify', verifyInviteClass)

router.use(middleware)
router.get('/me', getClass)
router.post('/create', createClass)
router.get('/me/:id',getClassByID)
router.put('/update', updateClass)
router.delete('/delete', deleteClass)
router.post('/invite', inviteClass)


module.exports = router;
