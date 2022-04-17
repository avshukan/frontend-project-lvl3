import { test, expect, describe } from '@jest/globals';
import tmp from '../src/index.js';

describe('mock', () => {
  test('test', () => {
    expect(true).toBeTruthy();
    expect(tmp(3, 4)).toBe(12);
  });
});
