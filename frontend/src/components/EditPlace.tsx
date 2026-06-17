import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getPlace, updatePlace } from '../api';
import { PlaceResponse } from '../interfaces';
import { ImageUploadField } from './third_party_components/ImageUpload';

const EditPlace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const placeFromState = (location.state as { place?: PlaceResponse } | null)?.place;

  const [loading, setLoading] = useState(!placeFromState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: placeFromState?.name ?? '',
    location: placeFromState?.location ?? '',
    country: placeFromState?.country ?? '',
    description: placeFromState?.description ?? '',
    image_urls: placeFromState?.image_paths ?? []
  });

  useEffect(() => {
    if (placeFromState || !id) return;

    const fetchPlace = async () => {
      try {
        const response = await getPlace(Number(id));
        const place = response.data;
        setForm({
          name: place.name,
          location: place.location,
          country: place.country,
          description: place.description ?? '',
          image_urls: place.image_paths ?? []
        });
        setLoading(false);
      } catch (err: unknown) {
        const message = isAxiosError<{ detail?: string }>(err)
          ? err.response?.data?.detail
          : undefined;
        setError(message ?? 'Failed to load place for editing.');
        setLoading(false);
      }
    };

    fetchPlace();
  }, [id, placeFromState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      await updatePlace(Number(id), {
        name: form.name,
        location: form.location,
        country: form.country,
        description: form.description || null,
        image_paths: form.image_urls || []
      });
      alert('Place updated successfully!');
      navigate('/places');
    } catch (err: unknown) {
      const message = isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail
        : undefined;
      setError(message ?? 'You do not have permission to update this place.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <h2 className="fw-bold mb-4">Edit Tourist Place</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-dark w-100 text-start">Name</Form.Label>
          <Form.Control
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-dark w-100 text-start">Location</Form.Label>
          <Form.Control
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-dark w-100 text-start">Country</Form.Label>
          <Form.Control
            required
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="small fw-bold text-dark w-100 text-start">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="placeImages">
          <ImageUploadField 
            urls={form.image_urls} 
            onChange={(urls: string[]) => setForm((prevForm) => ({
              ...prevForm,
              image_urls: urls
            }))} 
          />
        </Form.Group>


        <div className="d-flex gap-2">
          <Button variant="info" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button role='button' variant="outline-dark" onClick={() => navigate('/places')}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditPlace;
