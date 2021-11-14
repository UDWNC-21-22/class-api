const { StatusCodes } = require('http-status-codes')
const { OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
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
 * Craete class
 * @param ownerId string
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
    validate.required(['name', 'description', 'ownerId'])

    if (validate.hasError())
        return res.status(BAD_REQUEST).send({message: 'Create failed', error: validate.errors})

    try{
        await classModel.create(class_)
        return res.status(OK).send({message: 'Create successfully'})
    }
    catch(err){
        return res.status(BAD_REQUEST).send({message: 'Create failed'})
    }
    
}

const getClass = async (req, res) => {
    let user = new User(req.user)
    user = await userModel.findOne({id: user.id})

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
    getClassByID
}