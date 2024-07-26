import axios from 'axios';

const API_KEY = 'AIzaSyAzuokcJoK9OVlUIYL72Etr6fXSk0Nb34E' // 'AIzaSyAIGsYnmiSKf3hsMe-DaKrShv-yjr_OTpk';
const CX = '10074e14fd6a446f8' // '21add74e376274e71';

export const fetchSearchResults = async (query) => {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: CX,
        q: query,
        num: 6, // Number of results to fetch
        // searchType: 'image', // Request images
      }
    });
    console.log(response);
    return response.data.items;
  } catch (error) {
    console.error('Error fetching search results', error);
    return [];
  }
};
