// TODO: fix this spaghetti!!

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

          // if ingredient is NOT in iGood, add it (w/ count of 0)
          req.db.collection('iGood').findAndModify(
            { _id: ingredients[j] }, //query
            [], //sort
            { $setOnInsert: { _id: ingredients[j], count: 0 } }, // update
            { new: true,   // return new doc if one is upserted (unnecessary here)
            upsert: true},
            (err, result) => {
              if (err) { return console.log(err);}

              // otherwise, increment count of each ingredient (now new ingredient is at 1)

              // BUG: logic is bad here... adding same product over and over increments count
              // and it shouldn't... it should only incrememnt count for a new product

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


    // BUG: if product is first added to pGood, THEN change mind and add to pBad,
    // its ingredients stay in iGood, and are prevented from being placed/incremented in iBad

    // If product is in pGood, remove it
    req.db.collection('pGood').deleteOne( { _id: productId } ).then(function(results){
      console.log(JSON.stringify(results))
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

          // BUG: incrementation logic prob broken

          // if ingredient is NOT in iGood, add/increment it in iBad
          req.db.collection('iGood').count( {_id: ingredients[j]} )
          .then( (results) => {
            if (results < 1){
              req.db.collection('iBad').findAndModify(
                { _id: ingredients[j] }, //query
                [], //sort
                { $setOnInsert: { _id: ingredients[j], count: 0 } }, // update
                { new: true,   // return new doc if one is upserted (unnecessary here)
                upsert: true}, (err, result) => {
                  if (err) { return console.log(err);}

                  // otherwise, increment count of each ingredient (now new ingredient is at 1)
                  req.db.collection('iBad').findAndModify(
                    { _id: result.value._id }, [], { $inc: { count: 1 } } , {}, (err, result) => {
                      if (err) { return console.log(err);}
                    }); // inner findAndModify
                }); //outer findAndModify
            } else {
              console.log( ingredients[j] + ' is in iGood so, so not added to iBad' );
            }
          });
        })(i);  // argument to j
      } // for
    }); // then
});
