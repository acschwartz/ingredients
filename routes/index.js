var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  req.db.collection('schw1781_todo').find().toArray(function(err, results){
    res.render('index', { title: 'Express', todo: results });
    });
});

module.exports = router;
