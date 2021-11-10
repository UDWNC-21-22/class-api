const mongoose = require('mongoose');

class Class {
    constructor({
        id=null,
        name=null,
        description=null,
        memberId=[],
        ownerId=null,
        code=null
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.memberId = memberId;
        this.ownerId = ownerId;
        this.code = code;
    }
}

const classSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    memberId: [String],
    ownerId: String,
    code: String
});

const classModel = mongoose.model('class', classSchema);

module.exports = {
    Class,
    classModel
}