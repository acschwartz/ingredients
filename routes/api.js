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

  // TODO: deal with "UnhandledPromiseRejectionWarning: Unhandled promise rejection
  // (rejection id: 1): MongoError: E11000 duplicate key error [..]"
function addProductIdToCollection( db, coll, id ){
  db.collection(coll).insertOne({ _id: id })
  .then( (results) => {
    console.log("insert " + id + " into " + coll + " complete");
  })
  .catch( (error) => {
    throw error;
  });
}

function deleteProductIdFromCollection( db, coll, id ){
  db.collection(coll).deleteOne({ _id: id })
  .then( (results) =>{
    console.log( /* "delete " + id + " from " + coll + " complete"*/ );
  })
  .catch( (error) => {
    throw error;
  });
}


function ifExistsIncrementCount(db, coll, id, step, callback){
  // increments 'count' field of an existing record
  db.collection(coll).findAndModify(
    { _id: id }
    , []
    , { $inc: { count: step } })
  .then( (result) => { /* console.log(result) */ } )
  .then( callback( db, coll, id ) )
  .catch( (error) => {
    throw error;
  });
}

function ifNotExistsInsertWithCount ( db, coll, id ){
  db.collection(coll).count( { _id: id } )
  .then( (results) => {
    if (results < 1){
      db.collection(coll).insertOne( { _id: id, count: 1 } )
      .then( (results) =>{
        console.log("insert " + id + " into " + coll + " complete");
      })
      .catch( (error) => {
        throw error;
      });
    }
  });
};


// add product and its ingredients to 'good list'
router.post('/addgood', function(req, res, next) {
  var productId = req.body.id;
  var ingredients = [];

  addProductIdToCollection( req.db, 'pGood', productId );
  deleteProductIdFromCollection( req.db, 'pBad', productId );

  req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
  .then( (results) => {
      ingredients = results[0].ingredients;
      console.log('ingredients = ' +  ingredients);
  }).then( () => {
    // for each ingredient...
    for (i = 0; i < ingredients.length; i++){
      ((thisIngredient) => {
        // if ingredient is in iGood already, increment its count
        // if ingredient is NOT in iGood, add it
        ifExistsIncrementCount( req.db, 'iGood', thisIngredient, 1, ifNotExistsInsertWithCount );
      })(ingredients[i]); // arg for thisIngredient
    } // for
  })

  // res.status(200).send('success');
});


// add product and its ingredients to 'bad list'
router.post('/addbad', function(req, res, next) {
  var productId = req.body.id;

  addProductIdToCollection( req.db, 'pBad', productId );

  // res.status(200).send('success');
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
