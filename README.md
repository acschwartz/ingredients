# ingredients

# database decisons
products: unique index on pName (pName must be unique now)
ingredients: _id is ingredient name (may want to do same for product?)

# Challenges
## Get list of ingredient _id's into products document

Input: List of ingredient names
If item not in ingredients collection, add it.

First tried for loop that iterates through list of ingredient names, uses findAndModify to find or insert that ingredient, which returns that ingredient's _id.

Problem: asynch.

Attempted solution: callback hell.

New solution: in ingredients collection, use _id for document name. Now we do not have to fetch the id; we already have it from the start.
Use IIFE ([Immediately Invoked Function Expression](http://javascriptissexy.com/understand-javascript-closures-with-ease/)) to handle asynch problem in for loop.

## Logic
CRUD logic for products and ingredients. More complicated than it may seem.

## Database/Schema Design

Initial idea: pGood, pBad, iGood, iBad collections. Was hoping to either
a) Be able to control what shows up in the good/bad lists through CRUD logic (wayyyy too messy)
b) Be able to query the union between two collections. This was my lesson that this isn't SQL
