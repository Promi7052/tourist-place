// frontend/src/components/Login.tsx
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { authAPI } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authAPI.login({ email, password });
      navigate('/places'); // Redirect to your beautiful table list page on success
    } catch (err: unknown) {
      const message = isAxiosError<{ detail?: string }>(err)
        ? err.response?.data?.detail
        : undefined;
      setError(message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="shadow border-0 p-4" style={{ width: '100%', maxWidth: '420px' }}>
        <Card.Body>
          <h3 className="text-center fw-bold text-dark mb-4">Welcome Back</h3>
          
          {error && <Alert variant="danger" className="py-2 text-center small">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label className="small fw-bold text-dark w-100 text-start">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="name@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label className="small fw-bold text-dark w-100 text-start">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mb-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
            </Button>
          </Form>

          <div className="small mt-3">
            <span className="text-muted text-center">Don't have an account? </span>
            <Link to="/signup" className="text-primary fw-bold text-decoration-none">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;