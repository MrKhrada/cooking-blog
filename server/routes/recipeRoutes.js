const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

/**
 * App Routes
*/
router.get('/', recipeController.homepage);
router.get('/recipe/:id', recipeController.exploreRecipe );
router.get('/categories', recipeController.exploreCategories);
router.get('/categories/:id', recipeController.exploreCategoriesById);
router.post('/search', recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-random', recipeController.exploreRandom);
router.get('/submit-recipe', recipeController.submitRecipe);
router.post('/submit-recipe', recipeController.submitRecipeOnPost);

/**
 * Update
 */
router.get('/recipe/:id/update-recipe', recipeController.updateRecipe);
router.put('/recipe/:id', recipeController.updateRecipeOnPut);

/**
 * Delete
 */
router.delete('/recipe/:id', recipeController.deleteRecipe);

module.exports = router;