var express = require('express');
var router = express.Router();
const {
    getClass, 
    createClass, 
    getClassByID, 
    updateClass,
    deleteClass,
    inviteClass,
    verifyInviteClass,
    joinClass,
    updateAssignment
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
router.post('/join', joinClass)
router.post('/update-assignment', updateAssignment)


module.exports = router;
