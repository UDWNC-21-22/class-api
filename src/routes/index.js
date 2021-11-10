var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', (req, res, next)=>{
    res.render('index', {title: "Management Class API - version 1.0.1"})
});



module.exports = router;
