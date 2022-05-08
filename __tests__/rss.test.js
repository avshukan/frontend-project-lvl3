import fs from 'fs';
import { test, expect, describe } from '@jest/globals';
import FakeAxios from '../stubs/fakeAxious.js';
import getRssData, { getRssContent } from '../src/rss.js';

describe('rss', () => {
  test('getRssData', async () => {
    const status = 200;
    const data = {
      contents: 'xml',
    };
    const httpClient = new FakeAxios(status, data);
    const result = await getRssData('', httpClient);
    const expected = 'xml';
    expect(result).toEqual(expected);
  });

  test('getRssContent', () => {
    const xml = fs.readFileSync('./__fixtures__/rss.xml');
    const json = fs.readFileSync('./__fixtures__/rss.json');
    const result = getRssContent(xml);
    const expected = JSON.parse(json);
    expect(result).toMatchObject(expected);
  });
});
