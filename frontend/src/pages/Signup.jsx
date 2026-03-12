import { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../App.css';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const { registerUser, user } = useContext(AuthContext);

    if (user) {
        if (user.role === 'superadmin') return <Navigate to="/admin" />;
        if (user.role === 'subadmin') return <Navigate to="/subadmin" />;
        return <Navigate to="/user" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await registerUser(formData.name, formData.email, formData.password, formData.phone);
        if (!res.success) {
            setError(res.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="form-page-container">
            <div className="auth-form-wrapper">
                <h2>Create an Account</h2>
                {error && <p style={{ color: '#EF4444', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="auth-input"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="auth-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="auth-input"
                    />
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="auth-input"
                    />
                    <button type="submit" className="auth-submit-btn">Register Account</button>
                </form>
                <div className="auth-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
