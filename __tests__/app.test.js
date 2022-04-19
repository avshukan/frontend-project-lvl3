import { test, expect, describe } from '@jest/globals';
import app from '../src/app.js';

describe('mock', () => {
  test('test', () => {
    expect(true).toBeTruthy();
    expect(() => { app(); }).toThrow();
  });
});
