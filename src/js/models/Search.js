import axios from 'axios';

export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResults() {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const APIkey = 'e70e6f686daad65c207b85861b2b5d45';
    try {
      const result = await axios(
        `${proxy}https://www.food2fork.com/api/search?key=${APIkey}&q=${this.query}`
      );
      this.result = result.data.recipes;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}
