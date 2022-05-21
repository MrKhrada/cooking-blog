let addIngredientsBtn = document.getElementById('addIngredientsBtn');
let ingredientList = document.querySelector('.ingredientList');
let ingredientDiv = document.querySelectorAll('.ingredientDiv')[0];

// let updateRecipe = document.getElementById('update__recipe');

addIngredientsBtn.addEventListener('click', function(){
    let newIngredients = ingredientDiv.cloneNode(true);
    let input = newIngredients.getElementsByTagName('input')[0];
    input.value = '';
    ingredientList.appendChild(newIngredients);
});

$("#update__recipe").submit(function(event){
    event.preventDefault();

    let recipeDataAsArray = $(this).serializeArray();
    let data = {}

    $.map(recipeDataAsArray, function(n, i){
        data[n['name']] = n['value']
    })
    console.log(data);

    let request = {
        "url": `http://localhost:4004/recipe/${id}`,
        "method":"PUT",
        "data": data
    }

    $.ajax(request).done(function(response){
        alert("Recipe Updated Succesfully")
    })

})



