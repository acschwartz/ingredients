var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // req.db.collection('products').createIndex( { "pName": 1 }, { unique: true } )
  req.db.collection('products').find().toArray(function(err, results){
    console.log(results);
    res.render('index', { title: 'Express', products: results });
    });
});

module.exports = router;
