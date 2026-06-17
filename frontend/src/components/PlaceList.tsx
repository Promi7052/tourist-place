// frontend/src/components/PlacesList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { deletePlace, getPlace, getPlaces } from '../api';
import { PlaceResponse } from '../interfaces';
import { toTitleCase, firstCharCap, allCap } from '../utils/common';

const PlacesList = () => {
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await getPlaces(); 
        const rawData = response.data.results || response.data || response.data;
        setPlaces(Array.isArray(rawData) ? rawData : []);
        setLoading(false);
      } catch (err: unknown) {
        const message = isAxiosError<{ detail?: string }>(err)
          ? err.response?.data?.detail
          : undefined;
        setError(message ?? 'Failed to load tourist places.');
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await deletePlace(id);
        setPlaces(places.filter((place: PlaceResponse) => place.id !== id));
        alert('Place deleted successfully!');
      } catch (err: unknown) {
        const message = isAxiosError<{ detail?: string }>(err)
          ? err.response?.data?.detail
          : undefined;
        alert(message ?? 'You do not have permission to delete this place.');
      }
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const response = await getPlace(id);
      navigate(`/places/edit/${id}`, { state: { place: response.data } });
    } catch (err: unknown) {
      const message = isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail
        : undefined;
      alert(message ?? 'Failed to load place for editing.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading beautiful places...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center fw-bold">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      {/* Upper Action Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0">Explore Tourist Places</h2>
        <Button variant="info" role='button' className="fw-bold px-4 shadow-sm" onClick={() => navigate('/places/create')}>
          + Add New Place
        </Button>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h4>No places found. Be the first to add one!</h4>
        </div>
      ) : (
        /* Responsive React Bootstrap Table Configuration */
        <Table striped bordered hover responsive align="center" className="bg-white shadow-sm rounded-3 overflow-hidden">
          <thead className="table-dark">
            <tr>
              <th>Place Name</th>
              <th>Location</th>
              <th>Country</th>
              <th style={{ width: '100px' }}>Image</th>
              <th style={{ width: '160px' }} className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {places.map((place: PlaceResponse) => {

              return (
                <tr key={place.id}>
                  
                  <td className="fw-bold text-dark">{toTitleCase(place.name)}</td>
                  
                  <td>{firstCharCap(place.location)}</td>
                  
                  <td>{allCap(place.country)}</td>
                  
                  {/* Updated Multi-Image Column */}
                  <td>
                    <div className="place-images-container">
                      {place.image_paths && place.image_paths.length > 0 ? (
                        // Loop through all available image strings in the array
                        place.image_paths.map((path: string, index: number) => (
                          <img 
                            key={index}
                            src={new URL(`${path}`, import.meta.url).href} 
                            alt={`${place.name} thumbnail ${index + 1}`} 
                            className="place-table-thumb"
                          />
                        ))
                      ) : (
                        /* Fallback if the image array is empty */
                        <img 
                          src="https://via.placeholder.com/60x45?text=No+Img" 
                          alt="No images available" 
                          className="place-table-thumb"
                        />
                      )}
                    </div>
                  </td>
                  
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button 
                        variant="dark" 
                        size="sm" 
                        className="fw-bold px-3"
                        onClick={() => handleUpdate(place.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="danger"
                        size="sm" 
                        className="fw-bold"
                        onClick={() => handleDelete(place.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PlacesList;