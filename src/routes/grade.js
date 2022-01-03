var express = require('express');
var router = express.Router();
const {
    postGrade,
    getGradeByClass,
    getGradeByUser,
    exportGradeList,
    importGradeList,
    updateGrade,
    updateIsDone,
} = require('../controllers/grade.controller');
const {middleware} = require('../middlewares/jwt.middleware')
// const multer = require('multer');
// const { updateAssignment } = require('../controllers/class.controller');
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//       cb(null, './xlsxFolder');s
//     },
//     filename: function(req, file, cb) {
//         cb(null , file.originalname )
//     },
//   });
  
// const upload = multer({ storage: storage });

/* GET users listing. */
router.use(middleware)
router.post('/post', postGrade)
// router.get('/:classId/:assignmentId/export', exportGradeList)
// router.post('/:classId/:assignmentId/import', upload.single('data'), importGradeList)
router.post('/:classId/:assignmentId/isDone', updateIsDone)
router.post('/:classId/:assignmentId/:studentId', updateGrade)
router.get('/class/:id', getGradeByClass)
router.get('/me', getGradeByUser)



module.exports = router;
