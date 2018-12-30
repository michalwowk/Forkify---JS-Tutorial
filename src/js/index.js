import axios from 'axios';

// eslint-disable-next-line no-unused-vars
async function getResult(query) {
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  const APIkey = 'e70e6f686daad65c207b85861b2b5d45';
  try {
    const result = await axios(
      `${proxy}https://www.food2fork.com/api/search?key=${APIkey}&q=${query}`
    );
    const {
      data: { recipes }
    } = result;
    // eslint-disable-next-line no-console
    console.log(recipes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

// getResult('lasagne');
