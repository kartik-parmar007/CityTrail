import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './AdminBookings.css';

const AdminBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [actualPrices, setActualPrices] = useState({}); // To track input for each booking
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchBookings();
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/bookings', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(res.data);
            
            // Initialize actual prices with current prices
            const prices = {};
            res.data.forEach(b => {
                prices[b._id] = b.actualPrice || b.calculatedPrice;
            });
            setActualPrices(prices);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            setLoading(false);
        }
    };

    const handleSendOtp = async (bookingId) => {
        try {
            const price = actualPrices[bookingId];
            if (!price) return alert('Please set an actual price before sending OTP');

            await axios.post('/api/bookings/send-user-otp', { id: bookingId, actualPrice: price }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Final price set and OTP sent to user successfully.');
            fetchBookings();
        } catch (error) {
            console.error('Failed to send OTP', error);
            alert('Failed to send OTP: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdatePrice = async (bookingId) => {
        try {
            const price = actualPrices[bookingId];
            if (!price) return alert('Please enter a price');

            // Use the absolute path if axios baseURL isn't configured globally
            await axios.put(`/api/bookings/${bookingId}/price`, { price }, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            alert('Price updated successfully');
            fetchBookings();
        } catch (error) {
            console.error('Failed to update price', error);
            alert('Failed to update price: ' + (error.response?.data?.message || error.message));
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

    if (loading && bookings.length === 0) return <div className="admin-bookings-container">Loading bookings...</div>;

    return (
        <div className="admin-bookings-container">
            <h2 style={{ color: '#0f172a', fontWeight: '800' }}>Manage All Ride Bookings</h2>
            
            <div className="admin-bookings-list">
                {bookings.length === 0 ? <p>No ride bookings found.</p> : null}
                
                {bookings.map(b => (
                    <div key={b._id} className="admin-ride-card">
                        <div className="admin-card-header">
                            <h3>{b.pickupCity} → {b.dropCity}</h3>
                            <span className={`status-badge status-${b.status.toLowerCase()}`}>
                                {b.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        
                        <div className="admin-card-body">
                            <div className="admin-info-section">
                                <p className="admin-info-text">User: <strong>{b.user?.name || 'Deleted User'}</strong></p>
                                <p className="admin-info-text">Phone: <strong>{b.user?.phone || 'N/A'}</strong></p>
                                <p className="admin-info-text">Schedule: <strong>{b.rideDate} at {b.rideTime}</strong></p>
                                <p className="admin-info-text">Vehicle: <strong>{b.carType} ({b.rideType})</strong></p>
                                
                                <div className="admin-fare-box">
                                    <span className="admin-actual-fare">₹{b.actualPrice || b.calculatedPrice}</span>
                                    {b.estimatedPrice && b.estimatedPrice !== (b.actualPrice || b.calculatedPrice) && (
                                        <span className="admin-est-fare">₹{b.estimatedPrice}</span>
                                    )}
                                </div>
                            </div>

                            <div className="admin-modify-price-box">
                                <label>Modify Fare</label>
                                <div className="admin-price-input-group">
                                    <input 
                                        type="number" 
                                        className="admin-price-input"
                                        placeholder="New Price"
                                        value={actualPrices[b._id] || ''} 
                                        onChange={(e) => setActualPrices({...actualPrices, [b._id]: e.target.value})}
                                    />
                                    <button 
                                        className="btn-update-price"
                                        onClick={() => handleUpdatePrice(b._id)}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="admin-actions-footer">
                            {b.status === 'Pending' && (
                                <>
                                    <button
                                        className="btn-admin-primary"
                                        onClick={() => handleSendOtp(b._id)}
                                    >
                                        Verify Payment & Send OTP
                                    </button>
                                    <button
                                        className="btn-admin-outline-danger"
                                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                    >
                                        Cancel Ride
                                    </button>
                                </>
                            )}

                            {b.status === 'Payment_Verified_OTP_Sent' && (
                                <>
                                    <div className="admin-otp-badge">
                                        Security OTP: <strong>{b.otp}</strong>
                                    </div>
                                    <span className="admin-status-text">Waiting for user verification...</span>
                                    <button
                                        className="btn-admin-outline-danger"
                                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}

                            {b.status === 'OTP_Verified' && (
                                <>
                                    <button
                                        className="btn-admin-success"
                                        onClick={() => handleUpdateStatus(b._id, 'Completed')}
                                    >
                                        Mark as Completed
                                    </button>
                                    <button
                                        className="btn-admin-outline-danger"
                                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                                    >
                                        Cancel Ride
                                    </button>
                                </>
                            )}

                            {(b.status === 'Completed' || b.status === 'Cancelled') && (
                                <span className="admin-status-text">
                                    Ride was {b.status.toLowerCase()} on {new Date(b.updatedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminBookings;
