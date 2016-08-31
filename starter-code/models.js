// Setup
var mongoose = require("mongoose");
// connect to db
mongoose.connect("mongodb://localhost/mongoRelationships");
// shorthand so we don't have to type as much
var Schema = mongoose.Schema;

// Referenced Data
var foodSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  ingredients: [{
    type: Schema.Types.ObjectId,
    ref: 'Ingredient'
  }]
});

var ingredientSchema = new Schema({
  title: {
    type: String,
    default: ""
  },
  origin: {
    type: String,
    default: ""
  }
})


var Food = mongoose.model("Food", foodSchema);
var Ingredient = mongoose.model("Ingredient", ingredientSchema);

// Embedded Data
var tweetSchema = new Schema({
  text: String,
  date: Date
});

var userSchema = new Schema({
  name: {
    type: String,
    default: ""
  },
  tweets: [tweetSchema]
});

var User = mongoose.model("User", userSchema);
var Tweet = mongoose.model("Tweet", tweetSchema);

// Export
exports.Food = Food;
exports.Ingredient = Ingredient;
exports.User = User;
exports.Tweet = Tweet;

// Close connection on close
process.on('exit', function() {
  console.log('About to exit...');
  mongoose.disconnect(function() {
    console.log("Disconnected DB");
    process.exit(); // now exit the node app
  });
});
