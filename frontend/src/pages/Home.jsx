import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { CarFront, MapPin, Navigation, Calendar, Clock, IndianRupee } from 'lucide-react';
import '../Dashboard.css';

const INDIA_CITIES = [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand",
    "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Vapi",
    "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
    "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore",
    "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh"
].sort();

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
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

    const [bookingState, setBookingState] = useState('idle'); // idle, calculating, confirming
    const [calculatedPrice, setCalculatedPrice] = useState(0);

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
            const res = await axios.post('/api/bookings/calculate', formData);
            setCalculatedPrice(res.data.price);
            setBookingState('confirming');
        } catch (error) {
            console.error('Calculation failed', error);
            setBookingState('idle');
        }
    };

    const handleConfirmBooking = () => {
        if (!user) {
            // Redirect to login
            navigate('/login');
        } else {
            // If logged in, navigate to dashboard to finish booking
            navigate('/user');
        }
    };

    return (
        <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', maxWidth: '1200px' }}>
                <img src="/logo.jpeg" alt="CityTrail Logo" style={{ height: '50px', objectFit: 'contain' }} />

                {!user ? (
                    <Link to="/login" className="portal-btn btn-login" style={{ padding: '10px 20px' }}>Login</Link>
                ) : (
                    <Link to="/user" className="portal-btn btn-login" style={{ padding: '10px 20px' }}>Dashboard</Link>
                )}
            </div>

            <div className="glass-card" style={{ maxWidth: '600px', width: '100%', marginTop: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Book Your Ride</h2>

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
                                <ul className="suggestions-list" style={{ position: 'absolute', zIndex: 10, background: '#1e293b', width: '100%', maxHeight: '150px', overflowY: 'auto' }}>
                                    {filteredPickupCities.map((city, idx) => (
                                        <li key={idx} className="suggestion-item" style={{ padding: '10px', cursor: 'pointer' }} onMouseDown={() => handleCitySelect(city, 'pickup')}>{city}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-group" style={{ position: 'relative' }}>
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
                                <ul className="suggestions-list" style={{ position: 'absolute', zIndex: 10, background: '#1e293b', width: '100%', maxHeight: '150px', overflowY: 'auto' }}>
                                    {filteredDropCities.map((city, idx) => (
                                        <li key={idx} className="suggestion-item" style={{ padding: '10px', cursor: 'pointer' }} onMouseDown={() => handleCitySelect(city, 'drop')}>{city}</li>
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
                                <option value="Sedan">Sedan (4 Seater - ₹11/km)</option>
                                <option value="SUV">SUV (6-7 Seater - ₹12/km)</option>
                                <option value="Innova">Innova (Luxury - ₹18/km)</option>
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
                            <button type="submit" className="btn-premium" style={{ width: '100%' }}>Calculate Fare <IndianRupee size={18} style={{ display: 'inline' }} /></button>
                        </div>
                    </form>
                )}

                {bookingState === 'confirming' && (
                    <div className="confirmation-view" style={{ textAlign: 'center' }}>
                        <h3>Your Estimated Fare</h3>
                        <div className="fare-display" style={{ fontSize: '2rem', color: '#facc15', margin: '10px 0' }}>₹{calculatedPrice}</div>

                        <div className="ride-details" style={{ textAlign: 'left', marginBottom: '2rem', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                            <div className="detail-item" style={{ marginBottom: '10px' }}>
                                <span className="detail-label" style={{ color: '#94a3b8' }}>Route: </span>
                                <span className="detail-value" style={{ color: '#fff' }}>{formData.pickupCity} → {formData.dropCity}</span>
                            </div>
                            <div className="detail-item" style={{ marginBottom: '10px' }}>
                                <span className="detail-label" style={{ color: '#94a3b8' }}>Distance: </span>
                                <span className="detail-value" style={{ color: '#fff' }}>{formData.distanceEstimateKM} KM</span>
                            </div>
                            <div className="detail-item" style={{ marginBottom: '10px' }}>
                                <span className="detail-label" style={{ color: '#94a3b8' }}>Car Type: </span>
                                <span className="detail-value" style={{ color: '#fff' }}>{formData.carType}</span>
                            </div>
                            <div className="detail-item" style={{ marginBottom: '10px' }}>
                                <span className="detail-label" style={{ color: '#94a3b8' }}>Schedule: </span>
                                <span className="detail-value" style={{ color: '#fff' }}>{formData.rideDate} | {formData.rideTime}</span>
                            </div>
                        </div>

                        <div className="button-group" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={handleConfirmBooking} className="btn-success" style={{ padding: '10px 20px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Booking</button>
                            <button onClick={() => setBookingState('idle')} className="btn-secondary" style={{ padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            <footer style={{ width: '100%', textAlign: 'center', marginTop: 'auto', paddingTop: '3rem', paddingBottom: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} CityTrail.<br />
                All rights reserved by <a href="https://eaglebyte.in" target="_blank" rel="noopener noreferrer" className="footer-link">EagleByte.in</a>
            </footer>
        </div>
    );
};

export default Home;
