class ClassDTO {
    constructor({
        id=null,
        name=null,
        description=null,
        member=[],
        owner=[],
        code=null
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.member = member;
        this.owner = owner;
        this.code = code;
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