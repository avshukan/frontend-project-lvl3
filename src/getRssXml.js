import axios from 'axios';

export default (url) => axios.get(url).then((response) => response.data.contents);
