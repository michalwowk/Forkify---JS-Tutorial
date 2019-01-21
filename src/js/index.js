import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/**
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

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
  }
});
