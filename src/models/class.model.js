const mongoose = require('mongoose');

class Class {
    constructor({
        id=null,
        name=null,
        description=null,
        memberId=[],
        ownerId=[],
        code=null,
        inviteToken=[],
        assignments=[],
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.memberId = memberId;
        this.ownerId = ownerId;
        this.code = code;
        this.inviteToken = inviteToken;
        this.assignments = assignments;
    }
}

const classSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    memberId: [String],
    ownerId: [String],
    code: String,
    inviteToken: [String],
    assignments: [{
        id: String,
        name: String,
        description: String,
        index: Number,
        scoreRate: Number
    }]
});

const classModel = mongoose.model('class', classSchema);

module.exports = {
    Class,
    classModel
}