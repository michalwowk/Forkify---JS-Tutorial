import axios from 'axios';
import { APIkey, proxy } from '../config';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    try {
      const result = await axios(
        `${proxy}https://www.food2fork.com/api/search?key=${APIkey}&q=${this.query}`
      );
      this.results = result.data.recipes;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}
