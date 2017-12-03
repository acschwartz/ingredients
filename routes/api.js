var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;


// insert api
router.post('/insert', function(req, res, next) {

  var ingredients = req.body.ingredients.replace(/\.|\?|!/g, '').split(',');  //may need more work on regex

  (function addIngredients (){
  // If ingredient not in db, insert it

    for (i = 0; i < ingredients.length; i++) {
      ingredients[i] = function(j) {  // the j parametric variable is passed in on invocation of this IIFE

        var ing = ingredients[j].trim().toLowerCase();
        req.db.collection('ingredients').updateOne( { _id: ing }, { $set: { _id: ing } }, { upsert: true }
          , (err, results) => {
              if (err) { console.log(err) }
              // else { console.log(' ingredient inserted or updated ') }
          });
        return ing;
      }(i);
    }
  })();

  (function addProduct() {
  // Insert the new product to the database (using callback)
    req.db.collection('products').insertOne({ '_id': req.body.pName, 'ingredients': ingredients }, (err, results) => {
        if (err){
          console.log("insert product error: " + err)
        } else{
          console.log("insert complete")
          //send success status to client side
          res.status(200).send('success');
        }
    });
  })();

});






// delete api for TODO list/template
router.post('/delete', function(req, res, next) {
    // Delete the task sent specified the client side
    // using promise
    req.db.collection('schw1781_todo').deleteOne({ _id: ObjectId(req.body.id) }).then(function(results){
      console.log("delete complete");
      //send success status to client side
      res.status(200).send('success');
    }).catch(function(error){
      throw error;
    });

    console.log("async");
    //send success status to client side
    // res.status(200).send('success');
});

// update api for TODO list/template
router.post('/update', function(req, res, next) {
    // Update the status of the task to done
    req.db.collection('schw1781_todo').updateOne({ _id: ObjectId(req.body.id) }, { $set: { "done": req.body.status == 1 } });

    //send success status to client side
    res.status(200).send('success');
});


module.exports = router;
