import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import UserDashboard from './pages/UserDashboard';
import './App.css';
import Home from './pages/Home';

axios.defaults.baseURL = API_URL;

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

            <Route path="/subadmin" element={
              <ProtectedRoute allowedRoles={['subadmin', 'superadmin']}>
                <SubAdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
