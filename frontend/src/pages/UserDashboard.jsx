import { useState, useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, CarFront, History, User, LogOut, MapPin, Navigation, Calendar, Clock, IndianRupee } from 'lucide-react';
import '../Dashboard.css';

const INDIA_CITIES = [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand",
    "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Vapi",
    "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
    "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore",
    "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh"
].sort();

const UserDashboard = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('book'); // 'dashboard', 'book', 'history'
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        pickupCity: '',
        dropCity: '',
        rideType: 'One Way',
        carType: 'Sedan',
        distanceEstimateKM: 100,
        rideDate: '',
        rideTime: ''
    });

    // Autocomplete states
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDropSuggestions, setShowDropSuggestions] = useState(false);
    const [filteredPickupCities, setFilteredPickupCities] = useState([]);
    const [filteredDropCities, setFilteredDropCities] = useState([]);

    const [bookingState, setBookingState] = useState('idle'); // idle, calculating, confirming, otp, success
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [otp, setOtp] = useState('');
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [inlineOtpId, setInlineOtpId] = useState(null);
    const [historyFilter, setHistoryFilter] = useState('Pending'); // 'Pending', 'Confirmed', 'Cancelled'

    useEffect(() => {
        fetchMyBookings();
        
        // Auto refresh every 15 seconds to catch admin price updates
        const interval = setInterval(() => {
            fetchMyBookings();
        }, 15000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchMyBookings = async () => {
        try {
            const res = await axios.get('/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(res.data);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const handleCityChange = (e, type) => {
        const value = e.target.value;
        const filtered = INDIA_CITIES.filter(c => c.toLowerCase().includes(value.toLowerCase()));

        if (type === 'pickup') {
            setFormData({ ...formData, pickupCity: value });
            setFilteredPickupCities(filtered);
            setShowPickupSuggestions(true);
        } else {
            setFormData({ ...formData, dropCity: value });
            setFilteredDropCities(filtered);
            setShowDropSuggestions(true);
        }
    };

    const handleCitySelect = (city, type) => {
        if (type === 'pickup') {
            setFormData({ ...formData, pickupCity: city });
            setShowPickupSuggestions(false);
        } else {
            setFormData({ ...formData, dropCity: city });
            setShowDropSuggestions(false);
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setBookingState('calculating');

        try {
            const res = await axios.post('/api/bookings/calculate', formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCalculatedPrice(res.data.price);
            setBookingState('confirming');
        } catch (error) {
            console.error('Calculation failed', error);
            setBookingState('idle');
        }
    };

    const handleConfirmBooking = async () => {
        console.log('Confirming booking with data:', { ...formData, price: calculatedPrice });
        try {
            const res = await axios.post('/api/bookings/create', { ...formData, price: calculatedPrice }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log('Booking response:', res.data);
            setCurrentBookingId(res.data.bookingId);
            setBookingState('success');
            fetchMyBookings();
        } catch (error) {
            console.error('Booking creation failed', error);
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleVerifyOtp = async (e, directId = null, directOtp = null) => {
        if (e) e.preventDefault();
        const idToVerify = directId || currentBookingId;
        const otpToVerify = directOtp || otp;

        try {
            await axios.post('/api/bookings/verify-otp', { bookingId: idToVerify, otp: otpToVerify }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (directId) {
                alert('Booking verified successfully!');
                setInlineOtpId(null);
                setOtp('');
            } else {
                setBookingState('verified_success');
            }
            fetchMyBookings();
        } catch (error) {
            console.error('OTP verification failed', error);
            alert('Invalid OTP or verification failed.');
        }
    };

    const handleResendOtp = async () => {
        try {
            await axios.post('/api/bookings/resend-otp', { bookingId: currentBookingId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('OTP resend request sent successfully. Our admins will provide the new OTP shortly.');
        } catch (error) {
            console.error('Failed to resend OTP', error);
            alert('Failed to resend OTP.');
        }
    };

    const handleCancelBooking = async (bookingId, fromOtpScreen = false) => {
        if (!window.confirm("Are you sure you want to cancel this ride?")) return;
        try {
            await axios.post('/api/bookings/cancel', { id: bookingId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (fromOtpScreen) {
                setBookingState('idle');
                setCurrentBookingId(null);
                setOtp('');
            }
            fetchMyBookings();
        } catch (error) {
            console.error('Failed to cancel booking', error);
            alert('Failed to cancel the booking.');
        }
    };

    const renderSidebar = () => (
        <div className="dashboard-sidebar">
            <div className="sidebar-logo">
                <img src="/logo.jpeg" alt="CityTrail" style={{ height: '48px', objectFit: 'contain' }} />
            </div>

            <div className="nav-links">
                <button
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard /> Dashboard
                </button>
                <button
                    className={`nav-item ${activeTab === 'book' ? 'active' : ''}`}
                    onClick={() => setActiveTab('book')}
                >
                    <CarFront /> Book a Ride
                </button>
                <button
                    className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History /> My Rides
                </button>
                <button
                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User /> Profile
                </button>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <button className="nav-item" onClick={logout} style={{ color: '#f87171' }}>
                    <LogOut /> Logout
                </button>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    &copy; {new Date().getFullYear()} CityTrail. All Rights Reserved.<br />
                    Powered by <a href="https://eaglebyte.in" target="_blank" rel="noopener noreferrer" className="footer-link">EagleByte.in</a>
                </div>
            </div>
        </div>
    );

    const renderBookRide = () => (
        <div className="glass-card">
            <h2>Let's Get You Moving</h2>

            {bookingState === 'idle' && (
                <form onSubmit={handleCalculate} className="dashboard-form">
                    <div className="form-group">
                        <label><MapPin size={16} style={{ display: 'inline', marginRight: '5px' }} /> Pickup City</label>
                        <input
                            type="text"
                            className="premium-input"
                            placeholder="e.g., Ahmedabad"
                            value={formData.pickupCity}
                            onChange={e => handleCityChange(e, 'pickup')}
                            onFocus={() => setShowPickupSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                            required
                        />
                        {showPickupSuggestions && filteredPickupCities.length > 0 && (
                            <ul className="suggestions-list">
                                {filteredPickupCities.map((city, idx) => (
                                    <li key={idx} className="suggestion-item" onMouseDown={() => handleCitySelect(city, 'pickup')}>{city}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group">
                        <label><Navigation size={16} style={{ display: 'inline', marginRight: '5px' }} /> Drop City</label>
                        <input
                            type="text"
                            className="premium-input"
                            placeholder="e.g., Bhavnagar"
                            value={formData.dropCity}
                            onChange={e => handleCityChange(e, 'drop')}
                            onFocus={() => setShowDropSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowDropSuggestions(false), 200)}
                            required
                        />
                        {showDropSuggestions && filteredDropCities.length > 0 && (
                            <ul className="suggestions-list">
                                {filteredDropCities.map((city, idx) => (
                                    <li key={idx} className="suggestion-item" onMouseDown={() => handleCitySelect(city, 'drop')}>{city}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Ride Type</label>
                        <select className="premium-input premium-select" value={formData.rideType} onChange={e => setFormData({ ...formData, rideType: e.target.value })}>
                            <option value="One Way">One Way</option>
                            <option value="Two Way">Two Way (Round Trip)</option>
                            <option value="Local">Local Rental</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Car Category</label>
                        <select className="premium-input premium-select" value={formData.carType} onChange={e => setFormData({ ...formData, carType: e.target.value })}>
                            <option value="Sedan">Sedan (4 Seater - ₹10/km)</option>
                            <option value="SUV">SUV (6-7 Seater - ₹12/km)</option>
                            <option value="Innova">Innova (Luxury - ₹16/km)</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Estimated Distance (KM) [For Simulation]</label>
                        <input type="number" className="premium-input" value={formData.distanceEstimateKM} onChange={e => setFormData({ ...formData, distanceEstimateKM: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label><Calendar size={16} style={{ display: 'inline', marginRight: '5px' }} /> Date</label>
                        <input type="date" className="premium-input" min={new Date().toISOString().split('T')[0]} value={formData.rideDate} onChange={e => setFormData({ ...formData, rideDate: e.target.value })} required />
                    </div>

                    <div className="form-group">
                        <label><Clock size={16} style={{ display: 'inline', marginRight: '5px' }} /> Time</label>
                        <input type="time" className="premium-input" value={formData.rideTime} onChange={e => setFormData({ ...formData, rideTime: e.target.value })} required />
                    </div>

                    <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                        <button type="submit" className="btn-premium">Calculate Fare <IndianRupee size={18} /></button>
                    </div>
                </form>
            )}

            {bookingState === 'confirming' && (
                <div className="confirmation-view">
                    <h3>Your Estimated Fare</h3>
                    <div className="fare-display">₹{calculatedPrice}</div>

                    <div className="ride-details" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <div className="detail-item">
                            <span className="detail-label">Route</span>
                            <span className="detail-value">{formData.pickupCity} → {formData.dropCity}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Distance</span>
                            <span className="detail-value">{formData.distanceEstimateKM} KM</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Car Type</span>
                            <span className="detail-value">{formData.carType}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Schedule</span>
                            <span className="detail-value">{formData.rideDate} | {formData.rideTime}</span>
                        </div>
                    </div>

                    <div className="button-group">
                        <button onClick={handleConfirmBooking} className="btn-success">Confirm & Request Booking</button>
                        <button onClick={() => setBookingState('idle')} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            {bookingState === 'otp' && (
                <div className="confirmation-view">
                    <form onSubmit={handleVerifyOtp}>
                        <h3>Security Verification</h3>
                        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>An admin has confirmed your payment and sent an OTP to your registered email. Please enter it below.</p>

                        <div className="otp-inputs">
                            <input
                                type="text"
                                className="premium-input otp-input"
                                style={{ width: '150px', letterSpacing: '15px', fontSize: '1.5rem', textAlign: 'center' }}
                                maxLength="4"
                                placeholder="0000"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-premium">Verify & Confirm Ride</button>
                    </form>
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button type="button" onClick={handleResendOtp} className="btn-secondary" style={{ width: 'auto' }}>Resend OTP</button>
                        <button type="button" onClick={() => handleCancelBooking(currentBookingId, true)} className="btn-secondary" style={{ width: 'auto', background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}>Cancel Ride</button>
                    </div>
                </div>
            )}

            {bookingState === 'success' && (
                <div className="confirmation-view" style={{ animation: 'slideUp 0.5s ease' }}>
                    <div style={{ fontSize: '4rem', color: '#4ade80', margin: '1rem auto', width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                    <h3>Booking Requested!</h3>
                    <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>Our admin will call you shortly to arrange payment. Once payment is done, they will send you an OTP.</p>
                    <button onClick={() => { setBookingState('idle'); setOtp(''); setActiveTab('history'); fetchMyBookings(); }} className="btn-premium">View My Rides</button>
                </div>
            )}

            {bookingState === 'verified_success' && (
                <div className="confirmation-view" style={{ animation: 'slideUp 0.5s ease' }}>
                    <div style={{ fontSize: '4rem', color: '#4ade80', margin: '1rem auto', width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                    <h3>OTP Verified!</h3>
                    <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>Your booking is now verified. Your ride is confirmed. You can check the status in "My Rides".</p>
                    <button onClick={() => { setBookingState('idle'); setOtp(''); setActiveTab('history'); fetchMyBookings(); }} className="btn-premium">View My Rides</button>
                </div>
            )}
        </div>
    );

    const renderHistory = () => {
        const filteredBookings = bookings.filter(b => {
            if (historyFilter === 'Pending') return ['Pending', 'Payment_Verified_OTP_Sent', 'OTP_Verified'].includes(b.status);
            if (historyFilter === 'Confirmed') return ['Confirmed', 'Assigned', 'Enroute', 'Completed'].includes(b.status);
            if (historyFilter === 'Cancelled') return b.status === 'Cancelled';
            return true;
        });

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ color: '#fff', margin: 0 }}>My Bookings</h2>

                    <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', borderRadius: '12px', padding: '0.4rem', gap: '0.5rem' }}>
                        {['Pending', 'Confirmed', 'Cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setHistoryFilter(tab)}
                                style={{
                                    background: historyFilter === tab ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    color: historyFilter === tab ? '#fff' : '#94a3b8',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <CarFront size={48} color="#475569" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#94a3b8' }}>No {historyFilter.toLowerCase()} rides found</h3>
                        {historyFilter === 'Pending' && <button className="btn-premium" style={{ marginTop: '1.5rem', width: 'auto' }} onClick={() => setActiveTab('book')}>Book A Ride</button>}
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {filteredBookings.map(b => (
                            <div key={b._id} className="ride-card">
                                <div className="ride-card-header">
                                    <span className="detail-value">{b.rideDate?.substring(0, 10)}</span>
                                    <span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                                </div>

                                <div className="route-info">
                                    <div className="route-point">
                                        <div className="point-icon"></div>
                                        <span className="route-point-text">{b.pickupCity}</span>
                                    </div>
                                    <div className="route-connection"></div>
                                    <div className="route-point">
                                        <div className="point-icon dest"></div>
                                        <span className="route-point-text">{b.dropCity}</span>
                                    </div>
                                </div>

                                <div className="ride-details">
                                    {b.status === 'Pending' ? (
                                        <div className="detail-item">
                                            <span className="detail-label">Est. Fare</span>
                                            <span className="detail-value" style={{ color: '#facc15' }}>₹{b.estimatedPrice || b.calculatedPrice}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="detail-item">
                                                <span className="detail-label">Est. Fare</span>
                                                <span className="detail-value" style={{ textDecoration: 'line-through', fontSize: '0.8rem', opacity: 0.7 }}>₹{b.estimatedPrice || b.calculatedPrice}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Final Fare</span>
                                                <span className="detail-value" style={{ color: '#4ade80', fontWeight: 'bold' }}>₹{b.actualPrice || b.calculatedPrice}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="detail-item">
                                        <span className="detail-label">Vehicle</span>
                                        <span className="detail-value">{b.carType}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Ride Type</span>
                                        <span className="detail-value">{b.rideType}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Time</span>
                                        <span className="detail-value">{b.rideTime || 'N/A'}</span>
                                    </div>
                                </div>

                                {(['Pending', 'OTP_Verified', 'Assigned', 'Payment_Verified_OTP_Sent'].includes(b.status)) && (
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #334155', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {b.status === 'Payment_Verified_OTP_Sent' && (
                                            <div style={{ width: '100%', textAlign: 'center' }}>
                                                <p style={{ color: '#facc15', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                                                    Final Price set by Admin: ₹{b.actualPrice || b.calculatedPrice}
                                                </p>
                                                {inlineOtpId === b._id ? (
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter 4-digit OTP"
                                                            className="premium-input"
                                                            style={{ flex: 1, padding: '8px' }}
                                                            maxLength="4"
                                                            value={otp}
                                                            onChange={e => setOtp(e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => handleVerifyOtp(null, b._id, otp)}
                                                            className="btn-success"
                                                            style={{ width: 'auto', padding: '8px 15px' }}
                                                        >
                                                            Submit
                                                        </button>
                                                        <button
                                                            onClick={() => setInlineOtpId(null)}
                                                            className="btn-secondary"
                                                            style={{ width: 'auto', padding: '8px 15px' }}
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setInlineOtpId(b._id);
                                                            setOtp('');
                                                        }}
                                                        className="btn-success"
                                                        style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    >
                                                        Verify OTP
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleCancelBooking(b._id)}
                                            className="btn-secondary"
                                            style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                                        >
                                            Cancel Ride
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/auth/update-profile', profileData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUser({ ...res.data, token: user.token });
            setIsEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile.');
        }
    };

    const renderProfile = () => (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', animation: 'slideUp 0.5s ease' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Personal Information</h2>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', fontWeight: 'bold', color: '#000',
                    boxShadow: '0 10px 25px rgba(250, 204, 21, 0.4)',
                    marginBottom: '1rem'
                }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{user?.name}</h3>
                <span style={{ color: '#94a3b8', textTransform: 'capitalize', letterSpacing: '2px', fontSize: '0.85rem', marginTop: '0.5rem' }}>{user?.role} Account</span>
            </div>

            {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="dashboard-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group full-width">
                        <label>Full Name</label>
                        <input
                            type="text"
                            className="premium-input"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Mobile Number</label>
                        <input
                            type="text"
                            className="premium-input"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div className="button-group" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
                        <button type="submit" className="btn-success" style={{ width: 'auto' }}>Save Changes</button>
                        <button type="button" className="btn-secondary" onClick={() => setIsEditingProfile(false)} style={{ width: 'auto' }}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="ride-details" style={{ margin: 0 }}>
                        <div className="detail-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <span className="detail-label">Full Name</span>
                            <span className="detail-value" style={{ fontSize: '1.1rem' }}>{user?.name}</span>
                        </div>
                        <div className="detail-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <span className="detail-label">Email Address</span>
                            <span className="detail-value" style={{ fontSize: '1.1rem' }}>{user?.email}</span>
                        </div>
                        <div className="detail-item" style={{ paddingTop: '1rem' }}>
                            <span className="detail-label">Mobile Number</span>
                            <span className="detail-value" style={{ fontSize: '1.1rem' }}>{user?.phone || 'Not Provided'}</span>
                        </div>
                        <div className="detail-item" style={{ paddingTop: '1rem' }}>
                            <span className="detail-label">Member Since</span>
                            <span className="detail-value" style={{ fontSize: '1.1rem' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <button className="btn-secondary" onClick={() => setIsEditingProfile(true)} style={{ padding: '0.8rem 2rem', width: 'auto' }}>
                            Edit Details
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const renderDashboardOverview = () => {
        const pendingRides = bookings.filter(b => ['Pending', 'Payment_Verified_OTP_Sent', 'OTP_Verified'].includes(b.status)).length;
        const confirmedRides = bookings.filter(b => ['Confirmed', 'Assigned', 'Enroute'].includes(b.status)).length;
        const cancelledRides = bookings.filter(b => b.status === 'Cancelled').length;

        return (
            <div>
                <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                    <div className="glass-card" style={{ margin: 0, border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                        <div className="detail-label" style={{ color: '#facc15' }}>Pending Rides</div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#facc15' }}>{pendingRides}</div>
                    </div>
                    <div className="glass-card" style={{ margin: 0, border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                        <div className="detail-label" style={{ color: '#4ade80' }}>Confirmed Active</div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#4ade80' }}>{confirmedRides}</div>
                    </div>
                    <div className="glass-card" style={{ margin: 0, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <div className="detail-label" style={{ color: '#f87171' }}>Cancelled</div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#f87171' }}>{cancelledRides}</div>
                    </div>
                </div>

                <h3 style={{ color: '#fff', margin: '2rem 0 1rem 0' }}>Recent Activity</h3>
                {renderHistory()}
            </div>
        );
    };

    return (
        <div className="app-dashboard">
            {renderSidebar()}

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>
                        {activeTab === 'dashboard' && 'Overview'}
                        {activeTab === 'book' && 'Book a Ride'}
                        {activeTab === 'history' && 'Ride History'}
                        {activeTab === 'profile' && 'My Profile'}
                    </h1>

                    <div className="user-profile">
                        <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                        <span>{user?.name || 'Client'}</span>
                    </div>
                </div>

                {activeTab === 'dashboard' && renderDashboardOverview()}
                {activeTab === 'book' && renderBookRide()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'profile' && renderProfile()}
            </div>
        </div>
    );
};

export default UserDashboard;
