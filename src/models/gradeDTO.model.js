class GradeDTO {
    constructor({
        id=null,
        member=null,
        classes=null,
        grade=null,
        assignments=[]
    }) {
        this.id = id;
        this.member = member;
        this.classes = classes;
        this.grade = grade;
        this.assignments = assignments;
    }
}

class MemberGradeDTO{
    constructor({
        id=null,
        fullname=null,
        email=null,
    }){
        this.id = id;
        this.fullname = fullname;
        this.email = email;
    }
}

class ClassGradeDTO{
    constructor({
        id=null,
        name=null,
    }){
        this.id = id;
        this.name = name;
    }
}

module.exports = {
    GradeDTO,
    MemberGradeDTO,
    ClassGradeDTO
}