import axios from 'axios';
import makeUrlWithProxy from './makeUrlWithProxy.js';

export default (url) => axios.get(makeUrlWithProxy(url)).then((response) => response.data.contents);
