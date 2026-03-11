import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import AdminBookings from '../components/AdminBookings/AdminBookings';
import '../App.css';

const SubAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);


  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome Sub Admin, {user?.name}</h2>
        <button className="portal-btn" onClick={logout} style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
      </header>



      {/* Bookings Management Section */}
      <AdminBookings />

      <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} CityTrail.<br />
        All rights reserved by <a href="https://eaglebyte.in" target="_blank" rel="noopener noreferrer" className="footer-link">EagleByte.in</a>
      </footer>
    </div>
  );
};

export default SubAdminDashboard;
