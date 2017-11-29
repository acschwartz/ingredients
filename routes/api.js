var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

// insert api
router.post('/insert', function(req, res, next) {

  // TODO: check if product already in db
  // TODO: ingredients as data objects

    // Insert the new task to the database
    // using callback
    var ingredientList = req.body.ingredients.replace(/\.|\?|!/g, '').split(',');  //may need more work on regex
    for (i = 0; i < ingredientList.length; i++){
      ingredientList[i] = ingredientList[i].trim().toLowerCase();
    }

    req.db.collection('products').insertOne({ 'pName': req.body.pName, 'ingredients': ingredientList }, function(err, results){
      if (err){
        console.log("error")
      } else{
        console.log("insert complete")
        //send success status to client side
        res.status(200).send('success');
      }
    });

    console.log("async"); // see when this prints - could print before insert is done
    // which is why we want to put "insert done"/'succes' in the callback, and not below

    //send success status to client side
    // res.status(200).send('success');
});

// delete api
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

// update api
router.post('/update', function(req, res, next) {
    // Update the status of the task to done
    req.db.collection('schw1781_todo').updateOne({ _id: ObjectId(req.body.id) }, { $set: { "done": req.body.status == 1 } });

    //send success status to client side
    res.status(200).send('success');
});


module.exports = router;
