<!--
Creator:
Location: SF
-->

![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png)

# Data Associations with Mongoose

### Why is this important?
<!-- framing the "why" in big-picture/real world examples -->
*This workshop is important because:*

- Real-world data usually consists of different types of things that are related to each other in some way. A banking app might need to track employees, customers, and accounts. A food ordering app needs to know about restaurants, menus, and its users!  

- We've seen that when data is very simple, we can combine it all into one model.  When data is more complex or less closely tied together, we often create two or more related models.

- Understanding how to plan for, set up, and use related data will be essential to build more full-featured applications.

### What are the objectives?
<!-- specific/measurable goal for students to achieve -->
*After this workshop, developers will be able to:*


- Diagram one-to-one, one-to-many, and many-to-many data relationships.
- Compare and contrast embedded & referenced data.
- Design nested server routes for related resources.
- Build effective Mongoose queries for related resources.

### Where should we be now?
<!-- call out the skills that are prerequisites -->
*Before this workshop, developers should already be able to:*

* Use Mongoose to code Schemas and Models for single resources.
* Create, Read, Update, and Delete data with Mongoose.


### Numerical Categories for Relationships

###One-to-One

Each person has one brain, and each (living human) brain belongs to one person.

<img src="https://raw.githubusercontent.com/sf-wdi-22-23/modules-23/master/w03-intro-backend-with-express/d4-weekend-lab/img/one_to_one.png" alt="one to one erd"  width="250">

One-to-one relationships can sometimes just be modeled with simple attributes. A person and a brain are both complex enough that we might want to have their data in different models, with lots of different attributes on each.



###One-to-Many

Each tree "has many" leaves, and each leaf "belongs to" the one tree it grew from.

<img src="https://raw.githubusercontent.com/sf-wdi-22-23/modules-23/master/w03-intro-backend-with-express/d4-weekend-lab/img/one_to_many.png" alt="one to many erd" width="250">


###Many-to-Many

Each student "has many" classes they attend, and each class "has many" students.


<img src="https://raw.githubusercontent.com/sf-wdi-22-23/modules-23/master/w03-intro-backend-with-express/d4-weekend-lab/img/many_to_many.png" alt="many to many erd"  width="250">


###Entity Relationship Diagrams

Entity relationship diagrams (ERDs) represent information about the numerical relationships between data, or entities.

![Entity Relationship Diagram example](https://www.edrawsoft.com/images/examples/entity-relationship-diagram.png)


Note: In the example above, all of the Item1, Item2, Item3 under each heading are standing in for attributes.

[More guidelines for ERDs](http://docs.oracle.com/cd/A87860_01/doc/java.817/a81358/05_dev1.htm)



###Relationship Categories for Mongoose

**Embedded Data** is directly nested *inside* of other data. Each record has a copy of the data.


It is often *efficient* to embed data because you don't have to make a separate request or a separate database query -- the first request or query gets you all the information you need.  


![](http://docs.mongodb.org/manual/_images/data-model-denormalized.png)


**Referenced Data** is stored as an *id* inside other data. The id can be used to look up the information. All records that reference the same data look up the same copy.


It is usually easier to keep referenced records *consistent* because the data is only stored in one place and only needs to be updated in one place.  

![](http://docs.mongodb.org/manual/_images/data-model-normalized.png)




While the question of one-to-one, one-to-many, or  many-to-many is often determined by real-world characteristics of a relationship, the decision to embed or reference data is a design decision.  

There are tradeoffs, such as between *efficiency* and *consistency*, depending on which one you choose.  

When using Mongo and Mongoose, many-to-many relationships often involve referenced associations, while one-to-many often involve embedding data.


#### Check for Understanding

How would you design the following? Draw an ERD for each set of related data.

* `User`s with many `Tweets`?
* `Food`s with many `Ingredients`?


### Implementation: Referenced

#### Set Up Structure with Schemas

```javascript
var ingredientSchema = new Schema({
  title: {
    type: String,
    default: ""
  },
  origin: {
    type: String,
    default: ""
  }
});

var foodSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  ingredients: [{
    type: Schema.Types.ObjectId,  //REFERENCING :D
    ref: 'Ingredient'
  }]
});
```

Check out the value associated with the `ingredients` key inside the food schema. Here's how it's set up as an array of referenced ingredients:

- `[]` lets the food schema know that each food's `ingredients` will be an array
- The object inside the `[]` describes what kind of elements the array will hold.
- Giving `type: Schema.Types.ObjectId` tells the schema the `ingredients` array will hold ObjectIds. That's the type of that big beautiful `_id` that Mongo automatically generates for us (something like `55e4ce4ae83df339ba2478c6`).
- Giving `ref: Ingredient` tells the schema we will only be putting `Ingredient` instance ObjectIds inside the `ingredients` array.


#### Manipulate Data with Models

Now that we have our schemas defined, let's compile them all into active models so we can start creating documents!

```js
/* Compiling models from the above schemas */
var Food = mongoose.model('Food', foodSchema);
var Ingredient = mongoose.model('Ingredient', ingredientSchema);
```

Let's take our models for a spin and make two objects to test out creating a Ingredient document and Food document.

```js
/* make a new Ingredient document */
var cheddar = new Ingredient ({
 title: 'cheddar cheese',
 origin: 'Wisconson'
});
```

```js
/* make a new Food document */
var cheesyQuiche = new Food ({
  name: 'Quiche',
  ingredients: []
});
```

Notice that we start the `ingredients` array empty within our cheesyQuiche food document. That will be filled with ObjectIds later on.

Now we'll save our work.

```js
cheddar.save(function(err, savedCheese) {
  if (err) {
    return console.log(err);
  } else {
    console.log('cheesy quiche saved successfully');
  }
});

cheesyQuiche.ingredients.push(cheddar);
cheesyQuiche.save(function(err, savedCheesyQuiche) {
  if (err) {
    return console.log(err);
  } else {
    console.log('cheesyQuiche food is ', savedCheesyQuiche);
  }
});
```

Note that we push the `cheddar` ingredient document into the `cheesyQuiche` ingredients array. We already told the Food Schema that we will only be storing ObjectIds, though, so `cheddar` gets converted to its unique `_id` when it's pushed in!


#### Check for Understanding

This is the log text after executing the code we've written thus far:

```
cheesyQuiche food is { __v: 0,
  name: 'Quiche',
  _id: 55e4eb857d6157f4d41a2981,
  ingredients: [ 55e4eb857d6157f4d41a2980 ] }

cheesy quiche saved successfully

```


What are we looking at?

<details><summary>click for line-by-line explanation</summary>
1. Line 1: `__v` represents the number of times the document has been accessed.

1. Line 2: The `name` property of the `Food` document we have created.

1. Line 4: The unique `_id` created by Mongo for our `Food` document.

1. Line 5: The `ingredients` array, with a single `ObjectId` that is associated with our `Ingredient` document.

</details>


Mongoose is happy to show just the `ObjectId` associated with each ingredient in the food's `ingredients` array. When we need the `Ingredient` document data, we have to ask for it explicitly.

#### Pull Data in With `.populate()`

When we want to get full information from an `Ingredient` document we have inside the `Food` document `ingredients` array, we use a method called `.populate()`.

```js
Food.findOne({ name: 'Quiche' })
  .populate('ingredients')
  .exec(function(err, food) {
    if (err){
      return console.log(err);
    }
    if (food.ingredients.length > 0) {
      console.log('/nI love ' + food.name + ' for the '+ food.ingredients[0].name);
    }
    else {
      console.log(food.name + ' has no ingredients.');
    }
    console.log('what was that food?', food);
  });
```

<details><summary>Click to go over this method call line by line:</summary>

1. Line 1: We call a method to find only **one** `Food` document that matches the name: `Quiche`.

1. Line 2: We ask the ingredients array within that `Food` document to fetch the actual `Ingredient` document instead of just  its `ObjectId`.

1. Line 3: When we use `find` without a callback, then `populate`, like here, we can put a callback inside an `.exec()` method call. Technically we have made a query with `find`, but only executed it when we call `.exec()`.

1. Lines 4-15: If we have any errors, we will log them.  Otherwise, we can display the entire `Food` document **including** the populated `ingredients` array.

1. Line 9 demonstrates that we are able to access both data from the original `Food` document we found **and** the referenced `Ingredient` document we summoned.

</details>

<details>
  <summary>Click to see the output from the above `findOne()` method call with `populate`.</summary>

  ```
  {
    _id: 55e4eb857d6157f4d41a2981,
    name: 'Quiche',
    __v: 1,
    ingredients: [
       {
         _id: 55e4eb857d6157f4d41a2980,
         title: 'cheddar cheese',
         origin: 'Wisconson',
         __v: 0
       }
    ]
  }

  I love Quiche for the cheddar cheese
  ```
</details>

Now, instead of seeing **only** the `ObjectId` that pointed us to the `Ingredient` document, we can see the **entire** `Ingredient` document.

#### Routes for Referenced Data

When you need full information about a food, remember to pull ingredient data in with `populate`. Here's an example:

**index of all foods**
```js
// send all information for all foods
app.get('/api/foods/', function (req, res) {
  Food.find({ })
    .populate('ingredients')
    .exec(function(err, foods) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      console.log('found and populated all foods: ', foods);
      res.json(foods);
    });
});
```

> Many APIs don't populate all referenced information before sending a response. For instance, the Spotify API is riddled with ids that developers can use to make a second request if they want more of the information.

#### Check for Understanding

On which of the following routes are you most likely to `populate` all the ingredients of a food you look up?


|| | |
|---|---|---|
| **HTTP Verb** | **Path** | **Description** |
| GET | /foods | Get all foods |
| POST | /foods | Create a food |
| GET | /foods/:id | Get a food |
| DELETE | /foods/:id | Delete a food |
| GET | /foods/:food_id/ingredients | Get all ingredients from a food |


####Independent Practice: Foods & Ingredients

Get it:
* fork and clone this repo
* start up mongoDB with `mongod`
* `cd` into the folder `starter-code` in this directory
* `npm install` to install all the dependencies from `package.json`
* `node console.js` to enter into a REPL where you can interact with your DB. All the models will be nested inside an object called `db`.

Tips:
* save your successful code into a file for each step
* `<command>` + `<up>` will bring you to the last thing you entered in the repl

1. Create 3 ingredients.

1. Create a food that references those ingredients.

1. List all the foods.

1. List all the ingredient data for a food.




### Implementation: Embedded

Imagine you have a database of `User`s, each with many embedded `Tweet`s. If you needed to update or delete a tweet, you would first need to find the correct user, then the tweet to update or delete.


#### Set Up Structure with Schemas


```js
var tweetSchema = new Schema({
  text: String,
  date: Date
});
```

```js
var userSchema = new Schema({
  name: String,
  // embed tweets in user
  tweets: [tweetSchema]
});
```

The `tweets: [tweetSchema]` line sets up the embedded data association. The `[]` tells the schema to expect a collection, and `tweetSchema` (or `Tweet.schema` if you had a `Tweet` model defined already) tells the schema that the collection will hold *embedded* documents of type `Tweet`.

#### Manipulate Data with Models

```js
var User = mongoose.model("User", userSchema);
var Tweet = mongoose.model("Tweet", tweetSchema);
```

#### Independent Practice: Users & Tweets

1. Create a user.

1. Create tweets embedded in that user.

1. List all the users.

1. List all tweets of a specific user.

#### Routes for Embedded Data


**create tweet**
```js
// create tweet embedded in user
app.post('/api/users/:userId/tweets', function (req, res) {
  // set the value of the user id
  var userId = req.params.userId;

  // store new tweet in memory with data from request body
  var newTweet = new Tweet(req.body.tweet);

  // find user in db by id and add new tweet
  User.findOne({_id: userId}, function (err, foundUser) {
    foundUser.tweets.push(newTweet);
    foundUser.save(function (err, savedUser) {
      res.json(newTweet);
    });
  });
});
```

**update tweet**

```js
// update tweet embedded in user
app.put('/api/users/:userId/tweets/:id', function (req, res) {
  // set the value of the user and tweet ids
  var userId = req.params.userId;
  var tweetId = req.params.id;

  // find user in db by id
  User.findOne({_id: userId}, function (err, foundUser) {
    // find tweet embedded in user
    var foundTweet = foundUser.tweets.id(tweetId);
    // update tweet text and completed with data from request body
    foundTweet.text = req.body.tweetText;
    foundTweet.date = new Date(req.body.tweetDate);
    foundUser.save(function (err, savedUser) {
      res.json(foundTweet);
    });
  });
});
```

## Challenges

Sprint 3 of the [Mongoose Books App](https://github.com/SF-WDI-LABS/mongoose-books-app)


##Route Design

Remember RESTful routing? It's the most popular modern convention for designing resource paths for nested data. Here is an example of an application that has routes for `Store` and `Item` models:

###RESTful Routing
| | | | |
|---|---|---|---|
| **HTTP Verb** | **Path** | **Description** | **Key Mongoose Method(s)** |
| GET | /stores | Get all stores | `.find` |
| POST | /stores | Create a store | `new` `.save` |
| GET | /stores/:id | Get a store | `.findOne` |
| DELETE | /stores/:id | Delete a store | `.findOne`, `.remove` |
| GET | /stores/:store_id/items | Get all items from a store | `.findOne`, (`.populate` R) |
| POST | /stores/:store_id/items | Create an item for a store | `.findOne`, `new`, `.save` |
| GET | /stores/:store_id/items/:item_id | Get an item from a store | `.findOne`, (`.id` E) |
| DELETE | /stores/:store_id/items/:item_id | Delete an item from a store | `.findOne`, (`.id` E), `.remove` |

*In routes, avoid nesting resources more than one level deep.*

### Additional resources
- [Mongoose Sub-Document (Embedding) Docs](http://mongoosejs.com/docs/subdocs.html)
