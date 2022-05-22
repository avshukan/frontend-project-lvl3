import fs from 'fs';
import path, { dirname } from 'path';
import { test, expect, describe } from '@jest/globals';
import { fileURLToPath } from 'url';
import getRssContent from '../src/getRssContent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturesPath = (filename) => path.resolve(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturesPath(filename), 'utf-8');

describe('getRssContent', () => {
  test('getRssContent', () => {
    const xml = readFile('rss.xml');
    const expected = JSON.parse(readFile('rss.json'));
    expect(getRssContent(xml)).toMatchObject(expected);
  });
});
