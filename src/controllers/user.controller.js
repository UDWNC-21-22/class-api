


const userList = (req, res) => {
    const data = [
        {
            user: 'user 1',
            emai: 'email 1'
        },
        {
            user: 'user 2',
            emai: 'email 2'
        }
    ]
    
    return res.status(200).send({data})
}

module.exports = {
    userList
}