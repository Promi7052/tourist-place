import './../scss/custom.scss';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PlacesList from './components/PlaceList'
import EditPlace from './components/EditPlace'
import Login from './components/login'
import Signup from './components/signup'
import DashboardLayout from './components/DashboardLayout'
import CreatePlace from './components/CreatePlace'
import {Cloudinary} from "@cloudinary/url-gen";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {

  const cld = new Cloudinary({
    cloud: {
      cloudName: 'tourist_place'
    }
  });

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/places" replace />} />

          <Route path="/places" element={<PlacesList />} />

          <Route path="/places/create" element={<ProtectedRoute><CreatePlace /></ProtectedRoute>} />

          <Route path="/places/edit/:id" element={<ProtectedRoute><EditPlace /></ProtectedRoute>} />

        </Route>

        {/* 5. Fallback Catch-All (404 Page) */}
        <Route 
          path="*" 
          element={
            <div className="text-center mt-5 text-muted">
              <h3>404 - Page Not Found</h3>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App
