import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/bookings', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const handleSendOtp = async (bookingId) => {
        try {
            await axios.post('/api/bookings/send-user-otp', { id: bookingId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('OTP sent to user successfully via email.');
            fetchBookings();
        } catch (error) {
            console.error('Failed to send OTP', error);
            alert('Failed to send OTP');
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this ride as ${newStatus}?`)) return;
        try {
            await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchBookings();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status');
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ color: '#fff' }}>Manage Bookings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {bookings.length === 0 ? <p style={{ color: '#fff' }}>No bookings available.</p> : null}
                {bookings.map(b => (
                    <div key={b._id} style={{ background: '#1e293b', color: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px', marginBottom: '10px' }}>
                            <strong style={{ fontSize: '1.2rem' }}>{b.pickupCity} → {b.dropCity}</strong>
                            <span style={{ fontWeight: 'bold', color: b.status === 'Pending' ? '#facc15' : '#4ade80' }}>{b.status}</span>
                        </div>
                        <p style={{ margin: '5px 0', color: '#94a3b8' }}>User: <span style={{ color: '#fff' }}>{b.user?.name}</span> | Phone: <span style={{ color: '#fff' }}>{b.user?.phone}</span> | Email: <span style={{ color: '#fff' }}>{b.user?.email}</span></p>
                        <p style={{ margin: '5px 0', color: '#94a3b8' }}>Date: <span style={{ color: '#fff' }}>{b.rideDate} at {b.rideTime}</span> | Price: <span style={{ color: '#facc15' }}>₹{b.calculatedPrice}</span> | Car: <span style={{ color: '#fff' }}>{b.carType}</span></p>

                        {b.status === 'Pending' && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleSendOtp(b._id)}
                                    style={{ padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Payment Received - Send OTP
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                    style={{ padding: '8px 15px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                >
                                    Cancel Ride
                                </button>
                            </div>
                        )}
                        {b.status === 'Payment_Verified_OTP_Sent' && (
                            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <span style={{ padding: '5px 10px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', borderRadius: '4px', fontSize: '14px' }}>
                                    OTP sent to user, waiting for verification...
                                </span>
                                {b.otp && (
                                    <span style={{ fontSize: '14px', color: '#facc15' }}>
                                        Current OTP: <strong>{b.otp}</strong> (Provide to user if email fails)
                                    </span>
                                )}
                            </div>
                        )}
                        {b.status === 'OTP_Verified' && (
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ padding: '8px 10px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '4px', fontSize: '14px' }}>
                                    ✓ User Verified & Confirmed
                                </span>
                                <button
                                    onClick={() => handleUpdateStatus(b._id, 'Completed')}
                                    style={{ padding: '8px 15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                >
                                    Mark as Completed
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                    style={{ padding: '8px 15px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                >
                                    Cancel Ride
                                </button>
                            </div>
                        )}
                        {(b.status === 'Completed' || b.status === 'Cancelled') && (
                            <div style={{ marginTop: '15px' }}>
                                <span style={{ padding: '5px 10px', background: b.status === 'Completed' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: b.status === 'Completed' ? '#38bdf8' : '#ef4444', border: `1px solid ${b.status === 'Completed' ? '#38bdf8' : '#ef4444'}`, borderRadius: '4px', fontSize: '14px' }}>
                                    Ride {b.status}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminBookings;
