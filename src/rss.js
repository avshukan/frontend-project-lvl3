import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const getRssData = (url) => axios.get(url)
  .then((response) => {
    console.log('response', response);
    return { url, data: response.data };
  });

export const getRssContent = (data) => {
  console.log('data', data);
  const parser = new XMLParser();
  const xml = parser.parse(data);
  console.log('xml', JSON.stringify(xml));
  const builder = new XMLBuilder();
  const content = builder.build(xml);
  console.log('content', content);
  return xml;
};

export default getRssData;
