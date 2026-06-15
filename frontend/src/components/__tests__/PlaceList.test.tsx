import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlacesList from '../PlaceList';
import { deletePlace, getPlace, getPlaces } from '../../api';
import { createAxiosError, createAxiosResponse } from '../../test/axios-helpers';
import { renderWithRouter } from '../../test/test-utils';

const mockNavigate = vi.fn();

vi.mock('../../api', () => ({
  getPlaces: vi.fn(),
  getPlace: vi.fn(),
  deletePlace: vi.fn(),
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
  default: {},
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPlaces = {
  total_count: 2,
  page: 1,
  page_size: 10,
  results: [
    {
      id: 1,
      name: 'Eiffel Tower',
      location: 'Paris',
      country: 'France',
      description: 'Iconic landmark',
      created_at: '2026-01-01T00:00:00Z',
      image_paths: ['fort.jpg'],
    },
    {
      id: 2,
      name: 'Colosseum',
      location: 'Rome',
      country: 'Italy',
      description: 'Ancient amphitheatre',
      created_at: '2026-01-02T00:00:00Z',
      image_paths: [],
    },
  ],
};

describe('PlacesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('shows a loading spinner while fetching places', () => {
    vi.mocked(getPlaces).mockReturnValue(new Promise(() => {}));

    renderWithRouter(<PlacesList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders places after a successful fetch', async () => {
    vi.mocked(getPlaces).mockResolvedValue(createAxiosResponse(mockPlaces));

    renderWithRouter(<PlacesList />);

    expect(await screen.findByRole('heading', { name: /explore tourist places/i })).toBeInTheDocument();
    expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    expect(screen.getByText('Colosseum')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new place/i })).toBeInTheDocument();
  });

  it('shows an empty state when no places exist', async () => {
    vi.mocked(getPlaces).mockResolvedValue(
      createAxiosResponse({ total_count: 0, page: 1, page_size: 10, results: [] })
    );

    renderWithRouter(<PlacesList />);

    expect(await screen.findByText(/no places found/i)).toBeInTheDocument();
  });

  it('shows an error message when fetching fails', async () => {
    vi.mocked(getPlaces).mockRejectedValue(createAxiosError('Server unavailable'));

    renderWithRouter(<PlacesList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  });

  it('deletes a place after confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlaces).mockResolvedValue(createAxiosResponse(mockPlaces));
    vi.mocked(deletePlace).mockResolvedValue(createAxiosResponse(undefined));

    renderWithRouter(<PlacesList />);

    await screen.findByText('Eiffel Tower');

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deletePlace).toHaveBeenCalledWith(1);
    });
    expect(screen.queryByText('Eiffel Tower')).not.toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith('Place deleted successfully!');
  });

  it('navigates to edit page when edit is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(getPlaces).mockResolvedValue(createAxiosResponse(mockPlaces));
    vi.mocked(getPlace).mockResolvedValue(createAxiosResponse(mockPlaces.results[0]));

    renderWithRouter(<PlacesList />);

    await screen.findByText('Eiffel Tower');

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(getPlace).toHaveBeenCalledWith(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/places/edit/1', {
      state: { place: mockPlaces.results[0] },
    });
  });
});
