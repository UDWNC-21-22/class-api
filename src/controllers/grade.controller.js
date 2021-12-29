const { StatusCodes } = require('http-status-codes')
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
const { v1: uuidv1 } = require('uuid');
const ValidateService = require('../services/validate.service')
const ShortUniqueId = require('short-unique-id');
const { gradeModel, Grade } = require('../models/grade.model');
const { User, userModel } = require('../models/user.model');
const { isOwnerClass, isMemberClass} = require('../helpers/class.helper');
const { classModel } = require('../models/class.model');
const { GradeDTO, MemberGradeDTO, ClassGradeDTO } = require('../models/gradeDTO.model');
const {writeXlsxFile, readXlsxFile} = require('../helpers/xlsx.helpers');

/**
 * Get all grade student of class
 * @param classId string
 */
const getGradeByClass = async (req, res) => {
    console.log('hi');
    const user = new User(req.user)
    const classId = req.params.id

    if (!isOwnerClass(user.id, classId) || !isMemberClass(user.id, classId)) {
        return res.status(UNAUTHORIZED).send({message:"You not permission"})
    }

    var grades = await gradeModel.find({classId})

    grades = await Promise.all(grades.map(async g=>{
        let gradeDTO = new GradeDTO({})
        gradeDTO.id = g.id;
        
        gradeDTO.member = await userModel.findOne({id: g.memberId})
        gradeDTO.member = new MemberGradeDTO(gradeDTO.member._doc)

        gradeDTO.classes = await classModel.findOne({id: g.classId})
        gradeDTO.classes = new ClassGradeDTO(gradeDTO.classes._doc)

        gradeDTO.grade = g.grade
        return gradeDTO
    }))

    return res.status(OK).send({data: grades})

} 

const getGradeByUser = async (req, res) => {
    const user = new User(req.user);
    const userGrades = await gradeModel.find({memberId: user.id});
    var grades = []

    // console.log(userClasses)

    // for(let i = 0; i<userClasses.length; i++){
    //     const c = await classModel.find({id: userClasses[i].classId});
    //     console.log('lop', c);
    //     className.push({
    //         class: c.name,
    //         grade: userClasses[i].grade
    //     })
    // }

    grades = await Promise.all(userGrades.map(async g=>{
        let gradeDTO = new GradeDTO({})
        gradeDTO.id = g.id;
        
        gradeDTO.member = await userModel.findOne({id: g.memberId})
        gradeDTO.member = new MemberGradeDTO(gradeDTO.member._doc)

        gradeDTO.classes = await classModel.findOne({id: g.classId})
        gradeDTO.classes = new ClassGradeDTO(gradeDTO.classes._doc)

        gradeDTO.grade = g.grade
        return gradeDTO
    }))

    console.log(grades)



    return res.status(OK).send({data: grades})
}

/**
 * Create/Update grade student of class by ID
 * @param memberId string
 * @param classId string
 * @param grade number
 */
const postGrade = async (req, res) => {
    const user = new User(req.user)
    let gradeStudent = new Grade(req.body);

    let gradeValidate = new ValidateService(gradeStudent)
    gradeValidate.required(['memberId', 'classId', 'grade'])

    if (gradeValidate.hasError())
        return res.status(BAD_REQUEST).send({ message: "Post grade failed", errors: gradeValidate.errors})

    if (! await isOwnerClass(user.id, gradeStudent.classId)){
        return res.status(UNAUTHORIZED).send({ message: "You not permission"})
    }

    try{
        let gradeQuery = await gradeModel.findOne({memberId: gradeStudent.memberId, classId: gradeStudent.classId})
        if (!gradeQuery) {
            // create grade
            console.log("create grade")
            gradeStudent.id = uuidv1()
            await gradeModel.create(gradeStudent)
        }
        else{
            // update grade
            console.log("update grade")
            gradeStudent.id = gradeQuery.id
            await gradeModel.updateOne({memberId: gradeStudent.memberId, classId: gradeStudent.classId}, gradeStudent)
        }

        return res.status(OK).send({message: 'Post grade successfully'})
    }
    catch(e){
        console.log(e)
        return res.status(BAD_GATEWAY).send({message: "Post grade failed"})
    }
}

const exportGradeList = async (req, res) => {
    const {classId} = req.params;
    const _class = await classModel.findOne({id: classId});
 
    const students = [];

    for(let i = 0; i <  _class.memberId.length; i++){
        const student = await userModel.findOne({id: _class.memberId[i]});
        students.push({studentId: student.studentId, grade: ''});
    }

    writeXlsxFile('gradeList', students)
    return res.status(OK).download('./xlsxFolder/gradeList.xlsx');
    
}

const importGradeList = async (req, res) => {
    const file = req.file;
    console.log(file);
    const{classId, assignmentId} = req.params;
    const _class = await classModel.findOne({id: classId});
    const studentList = readXlsxFile(file.filename);

    studentList.forEach(async (e) => {
        const student = await userModel.findOne({studentId: e.studentId});
        const assignment = await gradeModel.findOne({memberId: student.id, classId: classId});
        const assName = _class.assignments.find(a => a.id == assignmentId);
        assignment?.assignments.push({id: assignmentId, name: assName.name, grade: e.grade})
        await gradeModel.updateOne({id: assignment.id}, {assignments: assignment.assignments})
    })

    return res.send({message: 'success'})
}

const updateGrade = async (req, res) => {
    const {classId, assignmentId, studentId} = req.params;
    console.log(req.body);
    let grade = await gradeModel.findOne({classId: classId, memberId: studentId});

    if(!grade.assignments){
        console.log(1);
        const _class = classModel.findOne({id: classId})
        const g = _class.assignments.find((item) => {
            if(item.id == assignmentId)
                return item
        })
        await gradeModel.updateOne({classId: classId, studentId: studentId}, {
            id: g.id,
            name: g.name,
            grade: req.body.grade
        })
    }
    else{
        const index = grade.assignments.findIndex((item) => {
            if(item.id == assignmentId)
                return item
        })
        grade.assignments[index].grade = req.body.grade
        await gradeModel.updateOne({classId: classId, studentId: studentId}, {assignments: grade.assignments})
    }

    return res.send({message: 'succeess'})
}

const getTotalGrade = async(req, res) => {
    const {classId} = req.params;
    const _class = await classModel.findOne({id: classId})
    const grades = [];
    for(let i = 0; i < _class.memberId.length; i++){
        const grade = await gradeModel.findOne({classId: classId, memberId: _class.memberId[i]});
        let assGrade = 0;
        for(let j = 0; j < _class.assignments.length; j++){
            const g = grade?.assignments.find((item) => {
                if(item.id == _class.assignments[j].id)
                    return item
            })
            if(!g){
                assGrade = assGrade + g?.grade;
            }
        }

        grades.push(assGrade);
    }

    return res.send({message: 'success', data: grades})
}

const updateIsDone = async (req, res) => {
    const {classId, assignmentId} = req.params;
    const _class = await classModel.findOne({id: classId});
    const index = _class.assignments.findIndex(element => element.id == assignmentId);
    console.log(classId);
    console.log(assignmentId);
    console.log(index);
    _class.assignments[index].isDone = true;
    await classModel.updateOne({id: classId}, {assignments: _class.assignments})
    return res.send({message: 'successed'})
}

module.exports = {
    postGrade,
    getGradeByClass,
    getGradeByUser,
    exportGradeList,
    importGradeList,
    updateGrade,
    getTotalGrade,
    updateIsDone
}