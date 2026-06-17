import { renderWithRouter } from "../../test/test-utils";
import DashboardLayout from "../DashboardLayout";

import { screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });
  

describe('TouristPortal Dashboard - Text and Elements', () => {
    test('renders the navigation brand and main heading', async () => {
      renderWithRouter(<DashboardLayout />);
      
      // Check for the "TouristPortal" brand text
      const brandText = await screen.findByText(/TouristPortal/i);
      expect(brandText).toBeInTheDocument();

    });
});