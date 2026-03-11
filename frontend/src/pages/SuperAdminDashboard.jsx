import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AdminBookings from '../components/AdminBookings/AdminBookings';
import '../App.css';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [subAdminData, setSubAdminData] = useState({ email: '', password: '', name: '', phone: '' });
    const [submessage, setSubMessage] = useState('');

    const handleAddSubAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/create-subadmin', subAdminData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSubMessage(res.data.message);
            setSubAdminData({ email: '', password: '', name: '', phone: '' });
        } catch (error) {
            setSubMessage(error.response?.data?.message || 'Server Error');
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Welcome Super Admin, {user?.name}</h2>
                <button className="portal-btn" onClick={logout} style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
            </header>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: '1', minWidth: '300px' }}>
                    <h3>Add New Sub Admin</h3>
                    {submessage && <p style={{ color: submessage.includes('success') ? 'green' : 'red', margin: '10px 0' }}>{submessage}</p>}
                    <form onSubmit={handleAddSubAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '1rem' }}>
                        <input type="text" placeholder="Name" required style={{ padding: '8px' }} value={subAdminData.name} onChange={e => setSubAdminData({ ...subAdminData, name: e.target.value })} />
                        <input type="email" placeholder="Email" required style={{ padding: '8px' }} value={subAdminData.email} onChange={e => setSubAdminData({ ...subAdminData, email: e.target.value })} />
                        <input type="password" placeholder="Password" required style={{ padding: '8px' }} value={subAdminData.password} onChange={e => setSubAdminData({ ...subAdminData, password: e.target.value })} />
                        <input type="tel" placeholder="Phone" style={{ padding: '8px' }} value={subAdminData.phone} onChange={e => setSubAdminData({ ...subAdminData, phone: e.target.value })} />
                        <button type="submit" className="portal-btn" style={{ border: 'none', cursor: 'pointer' }}>Create Sub Admin</button>
                    </form>
                </section>
            </div>

            {/* Bookings Management Section */}
            <AdminBookings />

            <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '1rem', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} CityTrail.<br />
                All rights reserved by <a href="https://eaglebyte.in" target="_blank" rel="noopener noreferrer" className="footer-link">EagleByte.in</a>
            </footer>
        </div>
    );
};

export default SuperAdminDashboard;
