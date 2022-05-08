import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const allOriginsUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const getRssData = (url, httpClient = axios) => httpClient.get(allOriginsUrl(url))
  .then((response) => {
    const { status, data } = response;
    if (status === 200) { return data; }
    throw new Error('Network response was not ok.');
  })
  .then(({ contents }) => contents);

export const getRssContent = (data) => {
  const parser = new XMLParser();
  const xml = parser.parse(data);
  return xml;
};

export default getRssData;
