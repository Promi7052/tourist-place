import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import App from './App';

let memoryRouterInitialEntries = ['/'];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={memoryRouterInitialEntries}>{children}</MemoryRouter>
    ),
  };
});

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users away from protected create route', () => {
    memoryRouterInitialEntries = ['/places/create'];
    render(<App />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('allows authenticated users to reach the create place page', () => {
    localStorage.setItem('access_token', 'test-token');
    memoryRouterInitialEntries = ['/places/create'];
    render(<App />);

    expect(screen.getByRole('heading', { name: /add new tourist place/i })).toBeInTheDocument();
  });

  it('shows a 404 page for unknown routes', () => {
    memoryRouterInitialEntries = ['/does-not-exist'];
    render(<App />);

    expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
  });
});
