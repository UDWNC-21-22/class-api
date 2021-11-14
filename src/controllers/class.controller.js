const { StatusCodes } = require('http-status-codes')
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
const { Class, classModel } = require('../models/class.model')
const { v1: uuidv1 } = require('uuid');
const CryptoJS = require("crypto-js");
const ValidateService = require('../services/validate.service')
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()
const ShortUniqueId = require('short-unique-id');
const { User, userModel } = require('../models/user.model');
const { ClassDTO, MemberDTO } = require('../models/classDTO.model');
const shortCode = new ShortUniqueId({length: 7})


/**
 * Create class
 * @param name string
 * @param description string
 */
const createClass = async (req, res)=>{
    let user = new User(req.user)
    // console.log("user: ", user)
    let class_ = new Class(req.body)
    class_.memberId = []
    class_.id = uuidv1()
    class_.code = shortCode()
    class_.ownerId = [user.id]

    let validate = new ValidateService(class_)
    validate.required(['name', 'description'])

    if (validate.hasError())
        return res.status(BAD_REQUEST).send({message: 'Create failed', error: validate.errors})

    try{
        user.classIdOwner.push(class_.id)
        await classModel.create(class_)
        await userModel.updateOne({id: user.id}, {classIdOwner: user.classIdOwner})
        return res.status(OK).send({message: 'Create successfully'})
    }
    catch(err){
        return res.status(BAD_REQUEST).send({message: 'Create failed'})
    }
    
}

/**
 * Update class
 * @param classId string
 * @param name string
 * @param description string
 */
const updateClass = async (req, res) => {
    
    let user = new User(req.user)

    let classUpdate = new Class(req.body)
    classUpdate.id = req.body.classId

    let validate = new ValidateService(classUpdate)
    validate.required(['name', 'description', "id"]);

    if (validate.hasError())
        return res.status(BAD_REQUEST).send({ message: 'Update failed', error: validate.errors })

    try {
        if (user.classIdOwner.indexOf(classUpdate.id) < 0) 
            return res.status(FORBIDDEN).send({ message: 'You not permission'})
        
        // console.log("classUpdate: ", classUpdate)
        await classModel.updateOne({id: classUpdate.id}, {
            name: classUpdate.name,
            description: classUpdate.description,
        })

        return res.status(OK).send({ message: 'Update successfully', data: classUpdate })
       
    }
    catch (err) {
        console.log(err)
        return res.status(BAD_GATEWAY).send({ message: 'Update failed' })
    }

}

/**
 * Delete class by ID
 * @param classId string
 */
const deleteClass = async(req, res)=>{
    let user = new User(req.user)
    if (!req.body.classId)
        return res.status(BAD_REQUEST).send({message: 'Id invalid'})
    
    if (user.classIdOwner.indexOf(req.body.classId)<0)
        return res.status(FORBIDDEN).send({message: 'You not permission'})
    
    try{
        user.classIdOwner = user.classIdOwner.filter(id => id != req.body.classId)
        await userModel.updateOne({id: user.id}, {classIdOwner: user.classIdOwner})
        await classModel.deleteOne({id: req.body.classId})
        return res.status(OK).send({message: 'Delete successfully'})
    }
    catch(err) {
        console.log(err)
        return res.status(BAD_GATEWAY).send({message: "Delete failed"})
    }


}


/**
 * Get info all my class
 */
const getClass = async (req, res) => {
    let user = new User(req.user)

    let classMemberList = await classModel.find({memberId: { $in: [user.id] } })
    let classOwnerList = await classModel.find({ownerId: user.id})

    classMemberList = classMemberList.map(item => new Class(item._doc))
    classOwnerList = classOwnerList.map(item => new Class(item._doc))

    let classMemberDTO = await Promise.all(classMemberList.map(async item => {
        const classDTO = new ClassDTO(item)
        classDTO.member = await userModel.find({id: {$in: item.memberId}})
        classDTO.member = classDTO.member.map(mem => new MemberDTO(mem))

        classDTO.owner = await userModel.find({id: {$in: item.ownerId}})
        classDTO.owner = classDTO.owner.map(mem => new MemberDTO(mem))

        return classDTO
      
    }))

    let classOwnerDTO = await Promise.all(classOwnerList.map(async item => {
        const classDTO = new ClassDTO(item)
        classDTO.member = await userModel.find({id: {$in: item.memberId}})
        classDTO.member = classDTO.member.map(mem => new MemberDTO(mem))
        classDTO.owner = await userModel.find({id: {$in: item.ownerId}})
        classDTO.owner = classDTO.owner.map(mem => new MemberDTO(mem))
        return classDTO
    }))


    return res.status(OK).send({data: {classMember: classMemberDTO, classOwner: classOwnerDTO}})
}

const getClassByID = async(req,res)=>{   
    const idClass = req.params.id; 
    let classroomQuery = await classModel.findOne({id: idClass})
    if (!classroomQuery) return res.status(BAD_REQUEST).send({ message: 'classroom not found' })
    return res.status(OK).send({ data: new Class(classroomQuery) })
}

module.exports = {
    getClass,
    createClass,
    getClassByID,
    updateClass,
    deleteClass
}