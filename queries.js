var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://cfnjynvibfomvm:dd35fe0b6c0e79220048ac82bab24aa2ad438006076df2dd8319f69f482500f3@ec2-54-221-212-208.compute-1.amazonaws.com:5432/denr3qsd4i8r2n';
var db = pgp(connectionString);
var dbServices = require('./dbServices')

function getAllRecipes(req, res, next) {
  dbServices.getAllRecipes().then(function(data) {
    res.status(200).json({
      status: 'success',
      data: data,
      message: 'Retrieved ALL recipes'
    });
  }).catch(function(err) {
    return next(err);
  });
}

function getSingleRecipe(req, res, next) {
  var recipeID = parseInt(req.params.id);
  db.one('select * from recipes where id = $1', recipeID).then(function(data) {
    return dbServices.getIngredientsForSingleRecipe(recipeID).then(ingredients => {
      return dbServices.getAllergies(recipeID).then(allergens => {
        return Object.assign(data, {
          ingredients: ingredients
        }, {allergens: allergens})
      })
    })
  }).then(function(data) {
    res.status(200).json({
      status: 'success',
      data: data,
      message: 'Retrieved ONE recipe'
    });
  }).catch(function(err) {
    return next(err);
  });
}

function checkForAllergens(req, res, next) {
  var recipeID = parseInt(req.params.id);
  dbServices.getAllergies(recipeID).then(data => {
    res.status(200).json({
      status: 'success',
      data: data,
      message: 'Retrieved Allergens for ONE recipe'
    });

  }).catch(function(err) {
    return next(err);
  });
}

module.exports = {
  getAllRecipes: getAllRecipes,
  getSingleRecipe: getSingleRecipe,
  checkForAllergens: checkForAllergens
}
