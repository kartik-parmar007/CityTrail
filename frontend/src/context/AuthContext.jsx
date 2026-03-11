import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser({ ...res.data, token });
                } catch (error) {
                    console.error("Token invalid or expired", error);
                    localStorage.removeItem('token');
                }
            }
            // Add a small delay for a better user experience of the loading screen
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        };

        fetchUser();
    }, []);

    const login = async (email, password, phone) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password, phone });
            setUser(res.data);
            localStorage.setItem('token', res.data.token);

            // Redirect based on role
            if (res.data.role === 'superadmin') navigate('/admin');
            else if (res.data.role === 'subadmin') navigate('/subadmin');
            else navigate('/user');

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, message: error.response?.data?.message || 'Invalid credentials' };
        }
    };

    const registerUser = async (name, email, password, phone) => {
        try {
            const res = await axios.post('/api/auth/register', { name, email, password, phone });
            setUser(res.data);
            localStorage.setItem('token', res.data.token);
            navigate('/user');
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, registerUser }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
