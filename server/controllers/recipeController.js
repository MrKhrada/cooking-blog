require('../models/database');
const req = require('express/lib/request');
const res = require('express/lib/response');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const deleteRecipe = require('../controllers/recipeController');
const { nextTick } = require('process');



/**
 * GET /
 * Homepage
 */
exports.homepage = async(req, res) => {
    try {
        const limitNumber = 5;
        const categories = await Category.find({}).limit(limitNumber);
        const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
        const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
        const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
        const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);
        
        const food =  { latest, thai, american, chinese };        

        res.render('index', { title: 'Cooking Blog - Home', categories, food } );
    }    catch (error) {
        res.status(500).send({message: error.message || "Error Occured"})
    }  
};

/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async(req, res) => {
    try {
        const limitNumber = 20;
        const categories = await Category.find({}).limit(limitNumber);
        res.render('categories', { title: 'Cooking Blog - Categories', categories } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured"})
    }  
};

/**
 * GET /category
 * Unique category
 */
 exports.exploreCategory = async(req, res) => {
    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const category = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        res.render('category', { title: 'Cooking Blog - Category', category } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured"})
    }  
};

/**
 * GET /categories/:id
 * Categories By Id
 */
 exports.exploreCategoriesById = async(req, res) => {
    try {
        let categoryId = req.params.id;
        const limitNumber = 20;
        const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
        const oneCategory = await Recipe.find({ 'category': categoryId }).limit(1);

        res.render('categories', { title: 'Cooking Blog - Categories', categoryById, oneCategory } );
    } catch (error) {
        res.status(500).send({message: error.message || "Error Occured"})
    }  
};


/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async(req, res) => {
    try {
      let recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId);
      res.render('recipe', { title: 'Cooking Blog - Recipe', recipe, deleteRecipe}  );
    } catch (error) {
      res.send({message: error.message || "Error Occured"});
    }
  } 




  /**
   * POST /search
   *   Search
   */
 exports.searchRecipe = async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        let recipe = await Recipe.find( { $text: { $search: searchTerm} });
        let categories = await Category.find( { $text: { $search: searchTerm} });
        res.render('search',  {title: 'Cooking Blog - Search', recipe, categories } ); 
    } catch (error) {
        res.status(500).send({message: error.message || "Error Ocurred"});
    }

  }


/**
 * GET /explore-latest
 * Explore latest 
*/
exports.exploreLatest = async(req, res) => {
    try {
        const limitNumber = 20;
        const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
      res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe } );
    } catch (error) {
      res.satus(500).send({message: error.message || "Error Occured"});
    }
  } 
  
/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
    try {
        
        let count = await Recipe.find().countDocuments();
        let random = Math.floor(Math.random() * count);
        let recipe = await Recipe.findOne().skip(random).exec();
        res.render('explore-random', { title: 'Cooking Blog - Explore Random', recipe } );
    } catch (error) {
      res.satus(500).send({message: error.message || "Error Occured"});
    }
  } 

/**
 * GET /submit-recipe
 * Submit Recipe 
*/
exports.submitRecipe = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj } );
}

/**
 * POST /submit-recipe
 * Submit Recipe 
*/
exports.submitRecipeOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.status(500).send(err);
      })

    }

    const newRecipe = new Recipe({
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.');
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}


/**
 * Post /update-recipe
 * Update Recipe
 */

 exports.updateRecipe = async (req,res) => {
  try {
    let recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
        const infoErrorsObj = req.flash('infoErrors');
        const infoSubmitObj = req.flash('infoSubmit');
        res.render('update-recipe', { title: 'Cooking Blog - Update', recipe, infoErrorsObj, infoSubmitObj} );
      } catch (error) {
        res.send({message: error.message || "Error Occured"});
  }
 }

/**
 * Put  /recipe/:id/update-recipe
 * Update Recipe Form
 */

exports.updateRecipeOnPut = async (req, res, next) => {
  req.recipe = await Recipe.findById(req.params.id)
  next()
}, saveRecipeAndRedirect('updated')

function saveRecipeAndRedirect(path) {
  return async (req, res) => {
    let recipe = req.recipe
    recipe.name = req.body.name
    recipe.email = req.body.email
    recipe.description = req.body.description
    recipe.ingredients = req.body.ingredients
    recipe.category = req.body.category
    try {
      recipe = await recipe.save()
      res.redirect(`recipe/${recipe.id}`)
    } catch (e) {
      res.render(`recipe/:id`, { recipe: recipe })
    }
  }
  } 
/**
 * Delete /recipe/:id
 * Delete Recipe
 */

exports.deleteRecipe = async (req, res) => {
  try{
    const removeRecipe = await Recipe.remove({_id: req.params.id });
    res.json(removeRecipe);
  } catch (err) {
    res.json({ message: err });
  }
}














/* Update by recipe id
// */

// exports.updateRecipeOnPut = (req,res) => {
//   if(!req.body){
//     return res
//       .status(400)
//       .send({message : "Data to update cannot be empty"})
//   }
//   const id = req.params.id;
//   Recipe.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
//   .then(data => {
//     if (!data){
//       res.status(404).send({message : `Cannot update recipe with ${id}.`})
//     } else {
//       res.send(data)
//     }
//   })
//   .catch(err =>{
//     res.status(500).send({message : "Error updating recipe data."})
//   })
// }




