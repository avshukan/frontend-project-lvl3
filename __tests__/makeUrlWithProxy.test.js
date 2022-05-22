import { test, expect, describe } from '@jest/globals';
import makeUrlWithProxy from '../src/makeUrlWithProxy';

describe('makeUrlWithProxy', () => {
  test('makeUrlWithProxy', () => {
    const url = 'https://ru.hexlet.io/lessons.rss';
    const expected = 'https://allorigins.hexlet.app/get?disableCache=true&url=https%3A%2F%2Fru.hexlet.io%2Flessons.rss';
    const result = makeUrlWithProxy(url);
    expect(result).toEqual(expected);
  });
});
