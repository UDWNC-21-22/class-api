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
    updateAssignment,
    //exportStudentList,
    //importStudentList,
    getGradeList,
    //downloadGrade,
} = require('../controllers/class.controller');
const {middleware} = require('../middlewares/jwt.middleware')
// const multer = require('multer')

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, './xlsxFolder');
//     },
//     filename: function(req, file, cb) {
//         cb(null , file.originalname )
//     },
//   });
  
// const upload = multer({ storage: storage });

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
router.get('/:classId/grade', getGradeList)
//router.get('/:classId/grade/download', downloadGrade)
//router.get('/:classId/export', exportStudentList)
//router.post('/:classId/import', upload.single('data'), importStudentList)



module.exports = router;
