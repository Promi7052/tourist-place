import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Signup from '../signup';
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

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders the signup form', () => {
    renderWithRouter(<Signup />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('registers a user and redirects to login on success', async () => {
    const user = userEvent.setup();
    vi.mocked(authAPI.signup).mockResolvedValue({
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      created_at: '2026-01-01T00:00:00Z',
    });

    renderWithRouter(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'securepass1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(authAPI.signup).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepass1',
      });
    });
    expect(window.alert).toHaveBeenCalledWith('Account created successfully! Please log in.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows an error message when registration fails', async () => {
    const user = userEvent.setup();
    vi.mocked(authAPI.signup).mockRejectedValue(createAxiosError('Email already registered'));

    renderWithRouter(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'securepass1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders the signup form with correct visuals and attributes', () => {
    renderWithRouter(<Signup />);

    // 1. Attribute Testing (Verify form inputs are configured correctly)
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Create strong password');

    // 2. Visual/Styling Testing
    // Verify button styling (assuming Bootstrap classes)
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toHaveClass('btn', 'btn-success'); // Replace 'btn-success' with your actual class
  });
});
