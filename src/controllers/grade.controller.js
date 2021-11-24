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


/**
 * Get all grade student of class
 * @param classId string
 */
const getGradeByClass = async (req, res) => {
    const user = new User(req.user)
    const classId = req.params.id

    if (!isOwnerClass(user.id, classId) || !isMemberClass(user.id, classId)) {
        return res.status(UNAUTHORIZED).send({message:"You not permission"})
    }

    let grades = await gradeModel.find({classId})

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

module.exports = {
    postGrade,
    getGradeByClass,
    getGradeByUser,
}