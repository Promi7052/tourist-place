import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EditPlace from '../EditPlace';
import { getPlace, updatePlace } from '../../api';
import { PlaceResponse } from '../../interfaces';
import { createAxiosError, createAxiosResponse } from '../../test/axios-helpers';
import { renderWithRouter } from '../../test/test-utils';

const mockNavigate = vi.fn();

vi.mock('../../api', () => ({
  getPlace: vi.fn(),
  updatePlace: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPlace: PlaceResponse = {
  id: 1,
  name: 'Eiffel Tower',
  location: 'Paris',
  country: 'France',
  description: 'Iconic landmark',
  created_at: '2026-01-01T00:00:00Z',
  image_paths: ['fort.jpg'],
};

function renderEditPlace(options: { id?: string; place?: PlaceResponse } = {}) {
  const id = options.id ?? '1';
  const entry = options.place
    ? { pathname: `/places/edit/${id}`, state: { place: options.place } }
    : `/places/edit/${id}`;

  return renderWithRouter(
    <Routes>
      <Route path="/places/edit/:id" element={<EditPlace />} />
    </Routes>,
    {
      routerProps: { initialEntries: [entry] },
    }
  );
}

describe('EditPlace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders the edit form heading', async () => {
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));

    renderEditPlace();

    expect(await screen.findByRole('heading', { name: /edit tourist place/i })).toBeInTheDocument();
  });

  it('populates the form after a successful fetch', async () => {
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));

    renderEditPlace();

    expect(await screen.findByDisplayValue('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('France')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Iconic landmark')).toBeInTheDocument();
    expect(getPlace).toHaveBeenCalledWith(1);
  });

  it('populates the form from navigation state without fetching', async () => {
    renderEditPlace({ place: mockPlace });

    expect(await screen.findByDisplayValue('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();
    expect(getPlace).not.toHaveBeenCalled();
  });

  it('shows an error message when fetching fails', async () => {
    vi.mocked(getPlace).mockRejectedValue(createAxiosError('Place not found'));

    renderEditPlace();

    expect(await screen.findByRole('alert')).toHaveTextContent('Place not found');
  });

  it('submits updated place data and navigates on success', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));
    vi.mocked(updatePlace).mockResolvedValue(createAxiosResponse(mockPlace));

    renderEditPlace();

    await screen.findByDisplayValue('Eiffel Tower');

    const nameInput = screen.getByDisplayValue('Eiffel Tower');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Tower');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updatePlace).toHaveBeenCalledWith(1, {
        name: 'Updated Tower',
        location: 'Paris',
        country: 'France',
        description: 'Iconic landmark',
      });
    });
    expect(window.alert).toHaveBeenCalledWith('Place updated successfully!');
    expect(mockNavigate).toHaveBeenCalledWith('/places');
  });

  it('sends null description when the field is cleared', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));
    vi.mocked(updatePlace).mockResolvedValue(createAxiosResponse(mockPlace));

    renderEditPlace();

    await screen.findByDisplayValue('Iconic landmark');

    const descriptionInput = screen.getByDisplayValue('Iconic landmark');
    await user.clear(descriptionInput);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updatePlace).toHaveBeenCalledWith(1, {
        name: 'Eiffel Tower',
        location: 'Paris',
        country: 'France',
        description: null,
      });
    });
  });

  it('shows an error message when update fails', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));
    vi.mocked(updatePlace).mockRejectedValue(createAxiosError('Permission denied'));

    renderEditPlace();

    await screen.findByDisplayValue('Eiffel Tower');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Permission denied');
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
  });

  it('shows a default error when update fails without a detail message', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));
    vi.mocked(updatePlace).mockRejectedValue(new Error('Network error'));

    renderEditPlace();

    await screen.findByDisplayValue('Eiffel Tower');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have permission to update this place.'
    );
  });

  it('navigates to places when cancel is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));

    renderEditPlace();

    await screen.findByDisplayValue('Eiffel Tower');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/places');
  });
});

// describe('EditPlace Visual Tests', () => {
  
//   test('verifies button and text colors', async () => {
//     renderWithRouter(<EditPlace />);
//     vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));

//     // 1. Testing Bootstrap Classes
//     // If your "Save" button has a Bootstrap class like 'btn-info'
//     const saveButton = await screen.findByRole('button', { name: /Save Canges/i });
//     const heading = screen.getByText(/Edit Tourist Place/i);
    
//     expect(heading).toHaveClass('text-dark'); // Standard dark text
//     expect(saveButton).toHaveClass('btn-info');
//   });

//   test('verifies Cancel button outline style', async () => {
//     renderWithRouter(<EditPlace />);
//     vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlace));

//     await screen.findByText(/cancel/i); // Just to wait for the page to load
//     screen.debug();
      
//     const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    
//     // Check for Bootstrap outline class
//     expect(cancelButton).toHaveClass('btn-outline-dark');
//   });
// });
