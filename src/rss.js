import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const getRssData = (url) => axios.get(url)
  .then(({ data }) => data);

export const getRssContent = (data) => {
  const parser = new XMLParser();
  console.log('data', data);
  const xml = parser.parse(data);
  return xml;
};

export default getRssData;
