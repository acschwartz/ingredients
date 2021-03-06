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
function insertRecord( db, coll, data ){
  db.collection(coll).insertOne( data )
  .then( (results) => {
    console.log("insert into " + coll + " complete");
  })
  .catch( (error) => {
    throw error;
  });
}

function deleteRecordById( db, coll, id ){
  db.collection(coll).deleteOne({ _id: id })
  .then( (results) =>{
    /* console.log( "delete " + id + " from " + coll + " complete" ); */
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
      insertRecord(db, coll, { _id: id, count: 1 } );
    }
  });
}


// TODO: BUG: I feel like sometimes ingredients get incremented all on their own??

// add product and its ingredients to 'good list'
router.post('/addgood', function(req, res, next) {
  var productId = req.body.id;
  var ingredients = [];

  insertRecord( req.db, 'pGood', { _id: productId } );
  // TODO: need more sophisticated check for existence of record... see further down
  // deleteRecordById( req.db, 'pBad', productId );

  req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
  .then( (results) => {
      ingredients = results[0].ingredients;
      console.log('ingredients = ' +  ingredients);
  }).then( () => {
    for (i = 0; i < ingredients.length; i++){
      ((thisIngredient) => {
        // if ingredient is in iGood already, increment its count
        // if ingredient is NOT in iGood, add it
        ifExistsIncrementCount( req.db, 'iGood', thisIngredient, 1, ifNotExistsInsertWithCount );

        // TODO: BUG: Adding same product more than once increments counts when it shouldn't...
        // need a check for if the profuct already exists in pGood. if so, ignore ingredients steps

        // if ingredient is in iBad, remove it
        // TODO: in future, may want to make it inactive
        // deleteRecordById( req.db, 'iBad', thisIngredient );

      })(ingredients[i]); // arg for thisIngredient
    } // for
  })

  res.status(200).send('success');
});

// add product and its ingredients to 'notsure list'
router.post('/addnotsure', function(req, res, next) {
  var productId = req.body.id;
  var ingredients = [];

  insertRecord( req.db, 'pNotSure', { _id: productId } );
  // TODO: need more sophisticated check for existence of record... see further down
  // deleteRecordById( req.db, 'pBad', productId );

  req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
  .then( (results) => {
      ingredients = results[0].ingredients;
      console.log('ingredients = ' +  ingredients);
  }).then( () => {
    for (i = 0; i < ingredients.length; i++){
      ((thisIngredient) => {
        // if ingredient is in iGood already, increment its count
        // if ingredient is NOT in iGood, add it
        ifExistsIncrementCount( req.db, 'iNotSure', thisIngredient, 1, ifNotExistsInsertWithCount );

        // TODO: BUG: Adding same product more than once increments counts when it shouldn't...
        // need a check for if the profuct already exists in pGood. if so, ignore ingredients steps

      })(ingredients[i]); // arg for thisIngredient
    } // for
  })

  res.status(200).send('success');
});


// TODO: now that I'm not handling any logic in the add functions, I can modularize

// add product and its ingredients to 'bad list'
router.post('/addbad', function(req, res, next) {
  var productId = req.body.id;
  var ingredients = [];

  insertRecord( req.db, 'pBad', { _id: productId } );

  // TODO: for now, adding to bad list does NOT delete from good list (product NOR ingredient)

  // deleteRecordById( req.db, 'pGood', productId ); // TODO: BUG: if delete from good list, must decrement iGood, right?!

  // ~~FOR NOW, iGood is a whitelist. being in iGood prevents an ingredients
  // from being added to iBad. TODO: revisit later~~
  // ABOVE: STRIKE THAT LOL... let's just track everything?

  req.db.collection('products').find( { _id: productId }, {ingredients: 1} ).toArray()
  .then( (results) => {
      ingredients = results[0].ingredients;
      console.log('ingredients = ' +  ingredients);
  }).then( () => {
    (function(){
      for (i = 0; i < ingredients.length; i++){
        ((thisIngredient) => {
          // // if ingredient is NOT in iGood, add or increment in iBad
          // req.db.collection('iGood').count( { _id: thisIngredient } )
          // .then ( (results) => {
          //   console.log(results);
          //   if (results < 1){
              ifExistsIncrementCount(req.db, 'iBad', thisIngredient, 1, ifNotExistsInsertWithCount);
              // TODO: BUG: Adding same product more than once increments counts when it shouldn't...
              // need a check for if the profuct already exists in pGood. if so, ignore ingredients steps

        })(ingredients[i]); // arg for thisIngredient
      } // for
    })();
  })


  res.status(200).send('success');
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
