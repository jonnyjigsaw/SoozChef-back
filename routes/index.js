var express = require('express');
var router = express.Router();

var db = require('../queries');


router.get('/api/recipes', db.getAllRecipes);
router.get('/api/recipes/:id/', db.getSingleRecipe);
router.get('/api/allergens/:id/', db.checkForAllergens);




module.exports = router;
