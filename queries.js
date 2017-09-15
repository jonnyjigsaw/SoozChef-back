var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/mealplanner';
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
