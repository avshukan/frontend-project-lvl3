import fs from 'fs';
import { test, expect, describe } from '@jest/globals';
import { getRssContent } from '../src/rss.js';

describe('rss', () => {
  test('getRssContent', () => {
    const xml = fs.readFileSync('./__fixtures__/rss.xml');
    const json = fs.readFileSync('./__fixtures__/rss.json');
    const result = getRssContent(xml);
    const expected = JSON.parse(json);
    expect(result).toMatchObject(expected);
  });
});
