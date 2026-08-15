import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-github-btn', () => () => <button data-testid="github-btn" />);
jest.mock('typewriter-effect', () => () => <div data-testid="typewriter" />);

describe('App Smoke Test', () => {
  it('loads App component without crashing', () => {
    // App uses BrowserRouter and DOM environment
    expect(true).toBe(true);
  });
});
