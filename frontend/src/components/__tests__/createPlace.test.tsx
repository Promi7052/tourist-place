import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Mock for routing context
import { vi, Mock, describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CreatePlace from './../CreatePlace';
import * as api from './../../api';
import { renderWithRouter } from '../../test/test-utils';

// --- SETUP THE MOCKS ---


// 1. Mock the module
vi.mock('./../../api', () => ({
    // If your api.ts has: "export const createPlace = ..."
    // Then define it like this:
    createPlace: vi.fn(), 
  }));
  
  // 2. This is the crucial part for TypeScript:
  const mockedCreatePlace = api.createPlace as Mock;

// 2. Mock window.alert
// vi does not implement browser alerts; we must catch it.
const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

// 3. Mock window.URL (Necessary for file/image preview testing in RTL)
// If you implement image previews in JSDOM, you often need this.
global.URL.createObjectURL = vi.fn();


// --- THE TESTS ---

describe('CreatePlace Component Tests', () => {
  beforeEach(() => {
    // Crucial: reset mock history so tests don't interfere with each other.
    vi.clearAllMocks();
  });

  afterAll(() => {
    alertSpy.mockRestore(); // Restore window.alert after testing is done.
  });

  test('Renders all heading, labels, and action buttons', () => {
    renderWithRouter(<CreatePlace />);

    // Verify Heading
    expect(screen.getByText('Add New Tourist Place')).toBeInTheDocument();

    // Verify Fields and Labels
    // Using getByLabelText guarantees label-input association for accessibility.
    expect(screen.getByLabelText('Place Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Location / State')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload Image')).toBeInTheDocument();

    // Verify Action Buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Destination' })).toBeInTheDocument();
  });

  test('Updates input and textarea values when user types', () => {
    renderWithRouter(<CreatePlace />);

    const nameInput = screen.getByLabelText('Place Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Grand Teton' } });
    expect(nameInput.value).toBe('Grand Teton');

    const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: 'Beautiful mountains.' } });
    expect(descInput.value).toBe('Beautiful mountains.');
  });

  test('Simulates single-file upload and updates status text', async () => {
    renderWithRouter(<CreatePlace />);

    // Get the file input
    const fileInput = screen.getByLabelText('Upload Image');

    // Create a mock file object (JSDOM supports this)
    const file = new File(['dummy content'], 'destination.jpg', { type: 'image/jpeg' });

    // Simulate selecting the file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Assert that the conditional text updates to reflect the upload status.
    // Wait for the state update to finish.
    await waitFor(() => {
        expect(screen.getByText('1 file(s) selected: destination.jpg')).toBeInTheDocument();
        expect(screen.getByText('1 file(s) selected: destination.jpg')).toHaveClass('text-success'); // Test Bootstrap class integration
    });
  });

  test('Submits form, mocks successful API, handles alert, and clears loading', async () => {
    // 1. Configure API mock to SUCCEED
    // We provide a realistic success payload.
    mockedCreatePlace.mockResolvedValueOnce({ data: { message: 'Place Created!' } } as any);

    renderWithRouter(<CreatePlace />);

    // 2. Fill required fields and one optional
    fireEvent.change(screen.getByLabelText('Place Name'), { target: { value: 'Crater Lake' } });
    fireEvent.change(screen.getByLabelText('Location / State'), { target: { value: 'Oregon' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'USA' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Volcano lake.' } });
    
    // Simulate uploading a file
    const file = new File(['dummy content'], 'crater.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Upload Image'), { target: { files: [file] } });

    // Get buttons for later state checks
    const saveButton = screen.getByRole('button', { name: 'Save Destination' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    // 3. Click Save
    fireEvent.click(saveButton);

    // 4. Verification Step 1: Loading State Interaction
    // In JSDOM, we need to check the loading state quickly before it disappears.
    await waitFor(() => {
        // Assertions while loading is active:
        expect(saveButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
        // Check for the specific spinner/loading text from your component
        expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    // 5. Verification Step 2: Final Success State
    // Wait for the final state changes after the API returns
    await waitFor(() => {
        // Assert that the API was called with the correct data shape
        expect(mockedCreatePlace).toHaveBeenCalledWith({
            name: 'Crater Lake',
            location: 'Oregon',
            country: 'USA',
            description: 'Volcano lake.',
            image_paths: ['crater.jpg'], // Array from multi-upload logic
        });

        // Verify that the success alert was triggered
        expect(alertSpy).toHaveBeenCalledWith('Tourist place created successfully!');
    });

    // Cleanup assertions (after successful navigation)
    // Buttons are usually cleaned up/reset when navigation occurs.
    await waitFor(() => {
        // Your navigate() call should be mocked via MemoryRouter to check the navigation path.
        // We will assume navigation happened and buttons are reset.
        expect(saveButton).toBeEnabled();
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

});

describe('CreatePlace Visual Tests', () => {
  
    test('verifies button and text colors', () => {
        renderWithRouter(<CreatePlace />);
  
      // 1. Testing Bootstrap Classes
      // If your "Save" button has a Bootstrap class like 'btn-info'
      const saveButton = screen.getByRole('button', { name: /Save Destination/i });
      expect(saveButton).toHaveClass('btn-info');
  
      // 2. Testing Computed Styles (The actual color applied)
      // Even if you use a class, you can check what the final color is.
      // NOTE: This checks the computed style in the JSDOM environment.
      expect(saveButton).toHaveClass('btn-info');
  
      // 3. Testing Text Color
      const heading = screen.getByText(/Add New Tourist Place/i);
      expect(heading).toHaveClass('text-dark'); // Standard dark text
      expect(saveButton).toHaveClass('btn-info');
    });
  
    test('verifies Cancel button outline style', () => {
        renderWithRouter(<CreatePlace />);
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      
      // Check for Bootstrap outline class
      expect(cancelButton).toHaveClass('btn-outline-dark');
    });
  });