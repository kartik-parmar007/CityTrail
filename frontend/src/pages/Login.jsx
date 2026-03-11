import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import '../App.css'; // Just using basic styles for now

const Login = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useContext(AuthContext);

    if (user) {
        if (user.role === 'superadmin') return <Navigate to="/admin" />;
        if (user.role === 'subadmin') return <Navigate to="/subadmin" />;
        return <Navigate to="/user" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        const res = await login(email, password, phone);
        if (!res.success) {
            setError(res.message || 'Invalid email, phone, or password');
        }
    };

    return (
        <div className="form-page-container">
            <div className="auth-form-wrapper">
                <h2>Welcome Back</h2>
                {error && <p style={{ color: '#EF4444', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <input
                        type="tel"
                        placeholder="10-Digit Mobile Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input"
                    />
                    <button type="submit" className="auth-submit-btn">Login</button>
                </form>
                <div className="auth-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
