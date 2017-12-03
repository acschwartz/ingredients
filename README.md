# ingredients

## This is what  I am using to standardize ingredient names:
https://www.skincarisma.com/ingredient-analyzer

# Database Decisions
Collections:

products[ { _id: "product name here", ingredients: [ "id", "id", "id" ] } ]
ingredients[ { _id: "ingredient name here" } ]

Product and ingredient names were chosen for the _id field as they are to be unique anyway.

Other planned collections:

pGood [ { _id: "ref product _id" } ]  - good products
pBad [ { _id: "ref product _id" } ]  - bad products
iGood [ { _id: "ref ingredient _id", count: n} ]  - good ingredients
iBad [ { _id: "ref ingredient _id", count: n} ]  - bad ingredients

This turned out disastrous; see below.

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
When a product is added to the list, are all of its ingredients deleted from the bad list?
I first had the good list be a whitelist that prevented any of its ingredients from going on the bad list.
 But what if some of those ingredients are on the bad list from a previous entry? What happens when I deleted
 an item from the good list? When you add a product to the good list, you delete its ingredients from the bad list? What about the other way around?


## Database/Schema Design

Initial idea: pGood, pBad, iGood, iBad collections. Was hoping to either
a) Be able to control what shows up in the good/bad lists through CRUD logic (wayyyy too messy)
b) Be able to query the union between two collections. This was my lesson that this isn't SQL. Similar objects that will be compared should not be in different collections.
