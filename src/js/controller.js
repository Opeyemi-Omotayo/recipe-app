import * as model from './model.js';
import recipeView from './views/recipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import icons from 'url:../img/icons.svg';
 //console.log(icons)

//const icons = 'http://localhost:1234/icons.21bad73c.svg';

const recipeContainer = document.querySelector('.recipe');

 // https://forkify-api.herokuapp.com/v2
 ///////////////////////////////////////

//# sourceMappingURL=index.62406edb.js.map

//console.log('test')

if(module.hot){
  module.hot.accept();
}

const controllRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    //console.log("id: " +id)

    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage())

    //Loading recipe

    await model.loadRecipe(id);

    // Rendering recipe
    recipeView.render(model.state.recipe);
    bookmarkView.render(model.state.bookmarks)

    
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
//controllRecipes();


const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner()
  
      // 1) Get search query
      const query = searchView.getQuery();
      if (!query) return;
  
      // 2) Load search results
      await model.loadSearchResults(query);
      //resultsView.render(model.state.search.results);
      resultsView.render(model.getSearchResultsPage());

      //render initial pagination buttons
      paginationView.render(model.state.search);

    } catch (err) {
      console.log(err);
    }
  };

  //controlSearchResults()

  const controlPaginationView = function(goToPage){
    //console.log(goToPage);

    //render new results
    resultsView.render(model.getSearchResultsPage(goToPage));

   //render new pagination buttons
    paginationView.render(model.state.search);

  
  }


  const controlServings = function(newServings){
    //updatte recipe servings(in state)
    model.updateServings(newServings)

    //update recipe view
    //recipeView.render(model.state.recipe);
    recipeView.render(model.state.recipe);
  }

  const controladdBookmarks = function(){
    //add/delete bookmark
    if(!model.state.recipe.bookmarked) {model.addBookmark(model.state.recipe)}
    else{ model.deleteBookmark(model.state.recipe.id)};
    console.log(model.state.recipe)

    //update view
    recipeView.render(model.state.recipe)

    //render bookmarks
    bookmarkView.render(model.state.bookmarks);
  }

  const controlBookmark = function(){
    bookmarkView.render(model.state.bookmarks)
  }

  const controlAddRecipe = async function(newRecipe){
    try {

      addRecipeView.renderSpinner()

      await model.uploadRecipe(newRecipe)
      console.log(model.state.recipe)

      //render recipe
      recipeView.render(model.state.recipe);

      //SUCCESS MESSAGE
      addRecipeView.renderMessage()

      //CLOSE FORM WINDOW
      setTimeout(function(){
        addRecipeView.toggleWindow()
      }, MODAL_CLOSE_SEC * 1000)

      //render bookmark
      bookmarkView.render(model.state.bookmarks)

      //change id in url
      window.history.pushState(null, '', `${model.state.recipe.id}`)

    } catch (error) {
      console.error(error);
      addRecipeView.renderError(error.message)
    }
    
  }

const init = function(){
  bookmarkView.addHandlerRender(controlBookmark)
   recipeView.addHandlerRender(controllRecipes);
   recipeView.addHandlerUpdateServings(controlServings);
   recipeView.addHandlerAddBookmark(controladdBookmarks)
   searchView.addHandlerSearch(controlSearchResults);
   paginationView.addHandlerClick(controlPaginationView);
   addRecipeView.addHandlerUpload(controlAddRecipe)
   
}
init();