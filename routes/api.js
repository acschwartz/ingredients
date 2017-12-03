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
      req.db.collection('ingredients').findAndModify(
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


// add product and its ingredients to 'good list'
router.post('/addgood', function(req, res, next) {

    var productId = req.body.id;

    // Add product to to pGood
    req.db.collection('pGood').insertOne({ _id: productId }).then(function(results){
      console.log("pGood insert complete");
      //send success status to client side
    }).catch(function(error){
      throw error;
    }); // TODO: deal with unhandled promise rejection when P is already in pGood (or do findAndModify)

    // If product is in pBad, remove it
    req.db.collection('pBad').deleteOne( { _id: productId } ).then(function(results){
      console.log("pBad delete complete");
    }).catch(function(error){
      throw error;
    });

    ingredients = [];
    req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
    .then( (results) => {
        ingredients = results[0].ingredients;
        console.log('ingredients = ' +  ingredients);
      })
    .then( () => {
      // for each ingredient...
      for (i = 0; i < ingredients.length; i++){
        ((j) => { // the j parametric variable is passed in on invocation of this IIFE

          // if ingredient is NOT in iGood, add it (w/ count of 1)
          // otherwise, increment its count
          req.db.collection('iGood').findAndModify(
            { _id: ingredients[j] }, //query
            [], //sort
            { $setOnInsert: { _id: ingredients[j], count: 0 } }, // update
            { new: true,   // return new doc if one is upserted (unnecessary here)
            upsert: true},
            (err, result) => {
              if (err) { return console.log(err);}

              req.db.collection('iGood').findAndModify(
                { _id: result.value._id }, [], { $inc: { count: 1 } } , {},
                (err, result) => {
                  if (err) { return console.log(err); }
                  console.log(JSON.stringify(result))
                  // if ingredient is in iBad, remove it
                  req.db.collection('iBad').deleteOne( { _id: result.value._id } )
                  .then( (results) => {
                    console.log("iBad delete complete");
                  })
                  .catch(function(error){
                    throw error;
                })});
              });
          })(i);
      } // for
    })
    .then( () => {
      //send success status to client side
      res.status(200).send('success');
    });
});

// add product and its ingredients to 'bad list'
router.post('/addbad', function(req, res, next) {
    var productId = req.body.id;

    // Add product to to pBad
    req.db.collection('pBad').insertOne({ _id: productId }).then(function(results){   // TODO: prob want some modularization here
      console.log("pBad insert complete");
    }).catch(function(error){
      throw error;
    }); // TODO: deal with unhandled promise rejection when P is already in pBad (or do findAndModify)

    // If product is in pGood, remove it
    req.db.collection('pGood').deleteOne( { _id: productId } ).then(function(results){
      console.log("pGood delete complete");
    }).catch(function(error){
      throw error;
    });




    ingredients = [];
    req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
    .then( (results) => {
        ingredients = results[0].ingredients;
      })
    .then( () => {
      // for each ingredient...
      for (i = 0; i < ingredients.length; i++){
        ((j) => { // the j parametric variable is passed in on invocation of this IIFE

          // TODO: if ingredient is NOT in iGood, add/increment it in iBad
          req.db.collection('iGood').count( {_id: ingredients[j]} ).then( (results) => { console.log(results) } );
        }
      )(i)
    }
    })

    //       // if ingredient is NOT in iGood, add it (w/ count of 1)
    //       // otherwise, increment its count
    //       req.db.collection('iGood').findAndModify(
    //         { _id: ingredients[j] }, //query
    //         [], //sort
    //         { $setOnInsert: { _id: ingredients[j], count: 0 }, $inc: { count: 1 } }, // update
    //         { new: true,   // return new doc if one is upserted (unnecessary here)
    //         upsert: true},
    //         (err, result) => {
    //           if (err) {return}
    //           // console.log(result.value._id);
    //           // TODO: handle error I guess
    //
    //           // if ingredient is in iBad, remove it
    //           req.db.collection('iBad').deleteOne( { _id: result.value._id } )
    //           .then( (results) => {
    //             console.log("iBad delete complete");
    //           })
    //           .catch(function(error){
    //             throw error;
    //           });
    //         });
    //       })(i);
    //   } // for
    // })
    // .then( () => {
    //   //send success status to client side
    //   res.status(200).send('success');
    // });

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
