// frontend/src/components/CreatePlace.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { isAxiosError } from 'axios';
import { createPlace } from '../api';
import { ImageUploadField } from './third_party_components/ImageUpload';

const CreatePlace = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPlace({
        name,
        location,
        country,
        description: description || null,
        image_paths: uploadedImages,
      });

      alert('Tourist place created successfully!');
      navigate('/places'); // Redirect back to your dashboard table list
    } catch (err: unknown) {
      const message = isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail
        : undefined;
      setError(message ?? 'Failed to create tourist place. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4 d-flex justify-content-center">
      <Card className={"card-bg-color shadow-sm border-0 p-2 w-100"} style={{ maxWidth: '700px' }}>
        <Card.Body>
          <h3 className="fw-bold text-dark mb-4">Add New Tourist Place</h3>

          {error && <Alert variant="danger" className="text-center small py-2">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Row 1: Name Field */}
            <Form.Group className="mb-3" controlId="placeName">
              <Form.Label className="small fw-bold text-dark w-100 text-start">Place Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Grand Canyon" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </Form.Group>

            {/* Row 2: Location and Country side-by-side */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="placeLocation">
                  <Form.Label className="small fw-bold text-dark w-100 text-start">Location / State</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., Arizona" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="placeCountry">
                  <Form.Label className="small fw-bold text-dark w-100 text-start">Country</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., United States" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Description Textarea */}
            <Form.Group className="mb-3" controlId="placeDescription">
              <Form.Label className="small fw-bold text-dark w-100 text-start">Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="Provide a captivating description of this destination..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Row 4: Multi-File Upload Control */}
            <Form.Group className="mb-4" controlId="placeImages">
              <ImageUploadField 
                urls={uploadedImages} 
                onChange={(url: string[]) => setUploadedImages(url)} 
              />
            </Form.Group>

            {/* Form Actions Footer Buttons */}
            <div className="d-flex gap-3 justify-content-end border-top pt-3">
              <Button 
                variant="outline-dark" 
                type="button" 
                className="px-4 fw-bold"
                onClick={() => navigate('/places')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="info" 
                type="submit" 
                className="px-4 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  'Save Destination'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePlace;