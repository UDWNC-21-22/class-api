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
    class_.ownerId = user.id

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

    let classMember = await classModel.find({memberId: { $in: [user.id] } })
    let classOwner = await classModel.find({ownerId: user.id})

    return res.status(OK).send({data: {classMember, classOwner}})

}


module.exports = {
    getClass,
    createClass
}