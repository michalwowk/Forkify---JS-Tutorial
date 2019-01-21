/* eslint-disable camelcase */
import axios from 'axios';
import { APIkey, proxy } from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `${proxy}https://www.food2fork.com/api/get?key=${APIkey}&rId=${this.id}`
      );
      const { title, publisher, image_url, source_url, ingredients } = res.data.recipe;
      this.title = title;
      this.author = publisher;
      this.img = image_url;
      this.url = source_url;
      this.ingredients = ingredients;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  calcTime() {
    // Assuming that we need 15 min for each 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      'tablespoon',
      'tablespoons',
      'ounces',
      'ounce',
      'teaspoon',
      'teaspoons',
      'cups',
      'pounds'
    ];
    const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map(el => {
      // 1) Uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      // 2) Remove parentheses
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

      // 3) Parse ingredients into count, unit and igredients
      const arrIng = ingredient.split(' ');
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        // There is a unit
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          // eslint-disable-next-line no-eval
          count = eval(arrIng[0].replace('-', '+'));
        } else {
          // eslint-disable-next-line no-eval
          count = eval(arrIng.slice(0, unitIndex).join('+'));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(' ')
        };
      } else if (parseInt(arrIng[0], 10)) {
        // There is no unit, but 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: '',
          ingredient: arrIng.slice(1).join(' ')
        };
      } else if (unitIndex === -1) {
        // there is NO unit and NO number
        objIng = {
          count: 1,
          unit: '',
          ingredient
        };
      }

      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // servings
    const newServigs = type === 'dec' ? this.servings - 1 : this.servings + 1;

    // ingredients
    this.ingredients.forEach(ing => {
      // eslint-disable-next-line no-param-reassign
      ing.count *= newServigs / this.servings;
    });

    this.servings = newServigs;
  }
}
