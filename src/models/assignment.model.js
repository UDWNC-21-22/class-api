class Assignment{
    constructor({
        id=null,
        name=null,
        description=null,
        index=null,
        scoreRate = null,
        isDone = null,
    }){
        this.id = id;
        this.name = name;
        this.description = description;
        this.index = index;
        this.scoreRate = scoreRate;
        this.isDone = isDone;
    }
}

module.exports = {
    Assignment
}