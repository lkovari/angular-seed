import { describe, it, expect } from 'vitest';
import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('should replace placeholders with params', () => {
    expect(interpolate('Hello, {{name}}', { name: 'World' })).toBe('Hello, World');
  });

  it('should return template unchanged when params are missing', () => {
    expect(interpolate('Hello, {{name}}')).toBe('Hello, {{name}}');
  });

  it('should leave unknown placeholders intact', () => {
    expect(interpolate('Hello, {{name}}', {})).toBe('Hello, {{name}}');
  });
});
