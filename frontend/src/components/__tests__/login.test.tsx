import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Login from '../login';
import { authAPI } from '../../api';
import { createAxiosError } from '../../test/axios-helpers';
import { renderWithRouter } from '../../test/test-utils';

const mockNavigate = vi.fn();

vi.mock('../../api', () => ({
  authAPI: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    renderWithRouter(<Login />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });

  it('submits credentials and navigates to places on success', async () => {
    const user = userEvent.setup();
    vi.mocked(authAPI.login).mockResolvedValue({
      access_token: 'test-token',
      token_type: 'Bearer',
      user: {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
        created_at: '2026-01-01T00:00:00Z',
      },
    });

    renderWithRouter(<Login />);

    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'securepass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'securepass1',
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/places');
  });

  it('shows an error message when login fails', async () => {
    const user = userEvent.setup();
    vi.mocked(authAPI.login).mockRejectedValue(createAxiosError('Invalid credentials'));

    renderWithRouter(<Login />);

    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('Login Card - Attribute & Visual Unit Tests', () => {
  
  test('verifies email input field attributes and centering', () => {
    renderWithRouter(<Login />);
    
    // 1. Verify the label text exists
    const emailLabel = screen.getByText(/Email Address/i);
    expect(emailLabel).toBeInTheDocument();
    
    // Check for Bootstrap centering alignment class visible in the image
    expect(emailLabel).toHaveClass('text-start');

    // 2. Verify the input field has correct type and placeholder
    const emailInput = screen.getByPlaceholderText('name@example.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('verifies password input field attributes and security type', async () => {
    renderWithRouter(<Login />);
    
    const passwordLabel = await screen.findByText(/Password/i);
    expect(passwordLabel).toBeInTheDocument();
    expect(passwordLabel).toHaveClass('text-start');

    // Crucial for security: ensure type is "password" so characters are hidden
    const passwordInput = screen.getByPlaceholderText('Enter password');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('verifies Sign In button styles and type', () => {
    renderWithRouter(<Login />);
    
    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    expect(signInButton).toBeInTheDocument();
    
    // Verify it functions as a form submit button
    expect(signInButton).toHaveAttribute('type', 'submit');

    // Check for the vibrant blue color branding seen in the screenshot
    expect(signInButton).toHaveClass('btn-primary');
  });

  test('verifies footer signup alignment and text attributes', async () => {
    renderWithRouter(<Login />);
    
    // Check for the footer wrapper text
    const footerText = await screen.findByText(/Don't have an account\?/i);
    
    expect(footerText).toBeInTheDocument();
    
    // The image shows the footer text centered at the bottom of the card
    expect(footerText).toHaveClass('text-center');
    expect(footerText).toHaveClass('text-muted');

    // Check that 'Sign Up' acts as a navigation link or anchor tag
    const signUpLink = await screen.findByRole('link', { name: /Sign Up/i });
    expect(signUpLink).toBeInTheDocument();
  });
});
