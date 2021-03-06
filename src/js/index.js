import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import { elements, renderLoader, clearLoader } from './views/base';

/**
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

window.s = state;

// //////////////////
// SEARCH CONTROLLER/
// //////////////////

const controlSearch = async () => {
  // 1) Get query form view
  const query = searchView.getInput();
  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);
    // 3) Prepare UI for results
    searchView.clearInputs();
    searchView.clearResults();
    renderLoader(elements.searchResult);

    // 4) Search for recipes
    try {
      await state.search.getResults();
      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.results);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Smth wrong with the search...');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResultPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.results, goToPage);
  }
});

// //////////////////
// RECIPE CONTROLLER/
// //////////////////

const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');
  // eslint-disable-next-line no-console
  console.log(id);

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected seatch item
    if (state.search) searchView.highligthSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    // Get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error processiong recipe !');
    }
  }
};

// //////////////////
// LIST CONTROLLER/
// //////////////////

const controlList = () => {
  // Create a new list IF there is none yet
  if (!state.list) state.list = new List();
  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const { count, unit, ingredient } = el;
    const item = state.list.addItem(count, unit, ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // delete form state
    state.list.deleteItem(id);
    // delete from UI
    listView.deleteItem(id);

    // handle count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

// //////////////////
// LIKE CONTROLLER/
// //////////////////

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const { id, title, author, img } = state.recipe;

  // User has not yet liked current recipe
  if (!state.likes.isLiked(id)) {
    // Add like to the state
    const newLike = state.likes.addLike(id, title, author, img);

    // Toggle the like button
    // Add like to UI list
    // User has  yet liked current recipe
  } else {
    // Remove like to the state
    state.likes.deleteLike(id);
    // Toggle the like button
    // Removew like from UI list
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// handling recipe button click
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease,.btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase,.btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
    // Handle add to list button
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList();
    // Handle likes button
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});
