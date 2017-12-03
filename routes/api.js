var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;


// insert api
router.post('/insert', function(req, res, next) {

  // If ingredient not in db, insert it
  var ingredients = req.body.ingredients.replace(/\.|\?|!/g, '').split(',');  //may need more work on regex
  for (i = 0; i < ingredients.length; i++) {
    ingredients[i] = function(j) {  // the j parametric variable is passed in on invocation of this IIFE
      var ing = ingredients[j].trim().toLowerCase();
      req.db.collection('ingredients').findAndModify(   // TODO: may want to just make this Update
        { _id: ing }, //query
        [], //sort
        { $setOnInsert: { _id: ing } }, // update
        { new: true,   // return new doc if one is upserted
        upsert: true});
      return ing;
    }(i);
  }

  (function insertProduct(){
    // Insert the new product to the database using callback
    req.db.collection('products').insertOne({ '_id': req.body.pName, 'ingredients': ingredients },
      function(err, results){
        if (err){
          console.log("insert product error")
        } else{
          console.log("insert complete")
          //send success status to client side
          res.status(200).send('success');
        }
    });

    console.log("async"); // see when this prints - could print before insert is done
    // which is why we want to put "insert done"/'success' in the callback, and not below

    //send success status to client side
    // res.status(200).send('success');
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
