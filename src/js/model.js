import { async } from 'regenerator-runtime';
//import { search } from "core-js/es6/symbol";
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON} from './helper.js';
import { AJAX} from './helper.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function(data){
  const recipe = data.data.recipe;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && {key : recipe.key}),
  };
  //console.log(state.recipe);
}

export const loadRecipe = async function (id) {
  //console.log('id ->' + id);
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    //console.log(data);

    state.recipe = createRecipeObject(data)
    

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    //alert(error)
    throw error;
  }
};

export const loadSearchResults = async function (query) {
  //console.log('pizza -> ' + query);
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    //console.log('mydata -> ' + data);
    //console.log(state.search.query)
    //console.log(query)

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key : rec.key}),
      };
    });
    state.search.page = 1;
    //console.log('state ---' + state.search.results[0].id);
  } catch (error) {
    alert(error);
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0;
  const end = page * state.search.resultsPerPage; // 9;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    //ing.qty * new servings/ old servings --- 2 *4/2
  });

  state.recipe.servings = newServings;
};

const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //add bookmarks
  state.bookmarks.push(recipe);

  //mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmark();
};

export const deleteBookmark = function (id) {
  //delete bookmarks
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.slice(index, 1);

  //remove current recipe from bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
console.log(state.bookmarks);

const clearBookmark = function () {
  localStorage.clear('bookmarks');
};
//clearBookmark()

export const uploadRecipe = async function (newRecipe) {
  try{
  const ingredients = Object.entries(newRecipe)
    .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ing => {
      const ingArr = ing[1].split(',').map(el => el.trim());
      // const ingArr = ing[1].replaceAll(' ', '').split(',');

      if (ingArr.length !== 3) {
        throw new Error('Wrong ingredient format!.Please use the correct format')
      }

      const [quantity, unit, description] = ingArr 
      return { quantity: quantity ? +quantity : null, unit, description };
    });
  console.log(ingredients);
  

  const recipe = {
    title: newRecipe.title,
    source_url: newRecipe.sourceUrl,
    image_url: newRecipe.image,
    publisher: newRecipe.publisher,
    cooking_time: +newRecipe.cookingTime,
    servings: +newRecipe.servings,
    ingredients,
  };

  const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
  state.recipe = createRecipeObject(data);
  addBookmark(state.recipe);
} catch (err) {
  throw err;
}
};
