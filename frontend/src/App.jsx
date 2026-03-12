<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { AuthProvider } from './context/AuthContext';
=======
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import AuthContext, { AuthProvider } from './context/AuthContext';

axios.defaults.baseURL = API_URL;
>>>>>>> b9f92a9bcdcc037a3ddfaa8e3442089792c02471
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import UserDashboard from './pages/UserDashboard';
import './App.css';
import Home from './pages/Home';

<<<<<<< HEAD
axios.defaults.baseURL = API_URL;
=======
function Placeholder({ role }) {
  return (
    <div>
      <h2>{role} Portal</h2>
      <p>This section is currently under construction. Future updates will include authentication, booking tables, and analytics.</p>
      <Link to="/">Back to Home</Link>
      <Link to="/login" style={{ marginLeft: '1rem' }}>Login</Link>
    </div>
  );
}
>>>>>>> b9f92a9bcdcc037a3ddfaa8e3442089792c02471

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/user" element={
              <ProtectedRoute allowedRoles={['user', 'superadmin']}>
                <UserDashboard />
              </ProtectedRoute>
            } />

<<<<<<< HEAD
=======

>>>>>>> b9f92a9bcdcc037a3ddfaa8e3442089792c02471
            <Route path="/subadmin" element={
              <ProtectedRoute allowedRoles={['subadmin', 'superadmin']}>
                <SubAdminDashboard />
              </ProtectedRoute>
            } />
<<<<<<< HEAD
=======

>>>>>>> b9f92a9bcdcc037a3ddfaa8e3442089792c02471
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
