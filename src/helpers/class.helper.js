const { classModel, Class } = require("../models/class.model")



const isOwnerClass = async (userId, classId)=>{
    let myClass = await classModel.findOne({id: classId});

    if (!myClass || myClass.ownerId.indexOf(userId) < 0 ){
        return false
    }
    else return true
}


const isMemberClass = async (userId, classId)=>{
    let myClass = await classModel.findOne({id: classId});

    if (!myClass || myClass.ownerId.indexOf(userId) < 0 ){
        return false
    }
    else return true
}

module.exports = {
    isOwnerClass,
    isMemberClass
}