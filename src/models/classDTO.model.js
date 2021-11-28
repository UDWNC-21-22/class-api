class ClassDTO {
    constructor({
        id=null,
        name=null,
        description=null,
        member=[],
        owner=[],
        code=null,
        assignments=[]
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.member = member;
        this.owner = owner;
        this.code = code;
        this.assignments = assignments;
    }
}

class MemberDTO {
    constructor({
        id=null,
        username=null,
        fullname=null,
        email=null
    }){
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.email = email;
    }
}

module.exports = {
    ClassDTO,
    MemberDTO
}