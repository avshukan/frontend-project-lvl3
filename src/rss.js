import axios from 'axios';

const getRssData = (url) => axios.get(url)
  .then((response) => {
    console.log(response);
    return { url, data: response };
  });

export default getRssData;
