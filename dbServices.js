var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://cfnjynvibfomvm:dd35fe0b6c0e79220048ac82bab24aa2ad438006076df2dd8319f69f482500f3@ec2-54-221-212-208.compute-1.amazonaws.com:5432/denr3qsd4i8r2n';
var db = pgp(connectionString);

module.exports = {
  getAllergies: function(recipeID) {
    return db.any('select  allergens.milk, \
                            allergens.nut, \
                            allergens.soybean, \
                            allergens.egg, \
                            allergens.gluten, \
                            allergens.fish, \
                            allergens.shellfish, \
                            allergens.meat \
                            from allergens \
                            join recipes_ingredients \
                            on recipes_ingredients.ingredient_id = allergens.ingredient_id \
                            where recipes_ingredients.recipe_id = $1;', recipeID)
      .then(data => {
      var resultObject = data.reduce(function(result, currentObject) {
        for (var key in currentObject) {
          if (currentObject.hasOwnProperty(key) && !result[key]) {
            result[key] = currentObject[key];
          }
        }
        return result
      })
      return resultObject
    })
  },

  getAllRecipes: function() {
    return db.any('SELECT recipes.id, \
                    recipes.name, \
                    recipes.source, \
                    recipes.is_healthy, \
                    recipes.photo_url, \
                    recipes.steps, \
                    json_agg(ingredients.*) as ingredients, \
                    json_agg(allergens.*) as allergens \
                    FROM recipes join recipes_ingredients on recipes_ingredients.recipe_id = recipes.id \
                    join ingredients on recipes_ingredients.ingredient_id = ingredients.id \
                    join allergens on recipes_ingredients.ingredient_id = allergens.ingredient_id \
                    GROUP BY recipes.id')
      .then(function(data) {
      var resultObject = data.forEach(function(element) {
        element.allergens.reduce(function(result, currentObject) {
          for (var key in currentObject) {
            if (currentObject.hasOwnProperty(key) && !result[key]) {
              result[key] = currentObject[key];
              result.id = element.id
            }
          }
          return result
        })

        element.allergens = element.allergens[0]
        delete element.allergens.id
        delete element.allergens.ingredient_id
      });
      return data
    })
  },

  getIngredientsForSingleRecipe: function(recipeID){
    return db.any('select ingredients.id, \
                    ingredients.name, \
                    ingredients.quantity_unit, \
                    recipes_ingredients.quantity AS quantity_num, \
                    ingredients.quantity_text \
                    from ingredients \
                    join recipes_ingredients on recipes_ingredients.ingredient_id = ingredients.id \
                    where recipes_ingredients.recipe_id=$1 \
                    group by ingredients.id, ingredients.name, recipes_ingredients.quantity, ingredients.quantity_text', recipeID)
  }

}
