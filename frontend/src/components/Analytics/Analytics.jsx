import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Users, Car, CheckCircle, XCircle, Clock, IndianRupee, Eye } from 'lucide-react';

const Analytics = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/api/admin/analytics', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch analytics');
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchAnalytics();
        }
    }, [user]);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Analytics...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!stats) return null;

    const cards = [
        { title: 'Total Users', value: stats.users.total, icon: <Users size={24} />, color: '#3b82f6' },
        { title: 'Site Visits', value: stats.siteVisits, icon: <Eye size={24} />, color: '#8b5cf6' },
        { title: 'Total Bookings', value: stats.bookings.total, icon: <Car size={24} />, color: '#10b981' },
        { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <IndianRupee size={24} />, color: '#f59e0b' },
        { title: 'Completed', value: stats.bookings.completed, icon: <CheckCircle size={24} />, color: '#059669' },
        { title: 'Cancelled', value: stats.bookings.cancelled, icon: <XCircle size={24} />, color: '#dc2626' },
        { title: 'Pending', value: stats.bookings.pending, icon: <Clock size={24} />, color: '#6366f1' },
        { title: 'Confirmed', value: stats.bookings.confirmed, icon: <CheckCircle size={24} />, color: '#2563eb' },
    ];

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Platform Analytics</h3>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {cards.map((card, idx) => (
                    <div key={idx} style={{
                        background: '#fff',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        borderLeft: `4px solid ${card.color}`
                    }}>
                        <div style={{ 
                            background: `${card.color}15`, 
                            padding: '12px', 
                            borderRadius: '10px',
                            color: card.color
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Recent Bookings</h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px' }}>User</th>
                                    <th style={{ padding: '12px' }}>Route</th>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBookings.map((booking, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 500 }}>{booking.user?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{booking.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>{booking.pickupCity} → {booking.dropCity}</td>
                                        <td style={{ padding: '12px' }}>{new Date(booking.rideDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.75rem',
                                                background: booking.status === 'Completed' ? '#dcfce7' : booking.status === 'Cancelled' ? '#fee2e2' : '#fef9c3',
                                                color: booking.status === 'Completed' ? '#166534' : booking.status === 'Cancelled' ? '#991b1b' : '#854d0e'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{booking.calculatedPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Analytics;
