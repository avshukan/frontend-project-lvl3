import 'jest-xml-matcher';
import fs from 'fs';
import path, { dirname } from 'path';
import { test, expect, describe } from '@jest/globals';
import { fileURLToPath } from 'url';
import nock from 'nock';
import getRssXml from '../src/getRssXml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturesPath = (filename) => path.resolve(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturesPath(filename), 'utf-8');

describe('getRssXml', () => {
  test('getRssXml', async () => {
    const host = 'https://ru.hexlet.io';
    const query = '/lessons.rss';
    const url = `${host}${query}`;
    const response = JSON.parse(readFile('response.json'));
    nock(host)
      .get(query)
      .reply(200, response);
    const result = await getRssXml(url);
    const expectedXML = readFile('rss.xml');
    expect(result).toEqualXML(expectedXML);
  });
});
