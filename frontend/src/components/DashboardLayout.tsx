// frontend/src/components/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { authAPI } from '../api';

const DashboardLayout = () => {
  return (
    <>
      {/* 👑 Persistent Header (Stays visible across all dashboard routes) */}
      <Navbar bg="dark" variant="dark" expand="md" className="mb-4 px-4 shadow-sm">
        <Container fluid>
          <Navbar.Brand href="/places" className="fw-bold fs-4 d-flex align-items-center gap-2">
            🌍 <span>TouristPortal</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="dashboard-nav-content" />
          
          <Navbar.Collapse id="dashboard-nav-content" className="justify-content-end">
            <Nav className="align-items-center gap-3 mt-2 mt-md-0">
              <Button 
                variant="outline-light" 
                size="sm" 
                className="fw-bold px-3 border-2"
                onClick={authAPI.logout}
              >
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🪟 Dynamic Window: Child routes (/places, /places/create) render right here */}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default DashboardLayout;