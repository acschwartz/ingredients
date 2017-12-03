var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var allGood = [];
  var allBad = [];
  var possibleBaddies = [];
  req.db.collection('iGood').find( {}, { _id: 1 } ).toArray()
  .then( (results) => {
    allGood = results;
    // console.log(results);
  }).then( () => {
    req.db.collection('iBad').find( {}, {_id: 1} ).toArray()
    .then( (results) => {
      allBad = results
      // console.log(results)
    }).then( () => {
      req.db.collection('iBad').aggregate( [ { $project: {"_id": 0, "baddies" : { $setDifference: [ allBad, allGood ] }}}] ).toArray()
      .then( (results) => {
        // console.log(JSON.stringify(results))
        // console.log(results);
        possibleBaddies = results[0].baddies;
        console.log(results[0].baddies)
      }).then( () => {
        (function(){
          for (i=0; i < possibleBaddies.length; i++){
            possibleBaddies[i] = possibleBaddies[i]._id;
            console.log(possibleBaddies[i])
          }
          (function(){
            req.db.collection('iBad').find( { _id: { $in: possibleBaddies } }, { _id: 1, count: 1} ).sort( { count: -1 } ).toArray()
            .then( (results) => {
              console.log(results);
              // res.render('index', { products: results })
            })
          })();
        })();
      })
    })
  })

  req.db.collection('products').find().toArray(function(err, results){
    // console.log(results);
    res.render('index', { title: 'Express', products: results });
    });
});

module.exports = router;
