import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
                    if (decodedToken.exp * 1000 < Date.now()) {
                        // Token expired
                        console.log("Token expired, logging out.");
                        logout();
                    } else {
                        setToken(storedToken);
                        // Fetch user data from API instead of localStorage
                        await refreshUser(storedToken);
                    }
                } catch (e) {
                    console.error("Error decoding token:", e);
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                // Fetch user data immediately after login to ensure up-to-date role
                await refreshUser(data.token);
                router.push('/'); // Redirect to home page after login
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message);
        }
    };

    const register = async (username, email, password, phone) => {
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, phone }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Registration successful! Please log in.');
                router.push('/login'); // Redirect to login page after registration
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message);
        }
    };

    const refreshUser = async (authToken = token) => {
        if (!authToken) return;
        try {
            const res = await fetch('/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                console.error("Failed to refresh user data. Status:", res.status);
                logout(); // Log out if user data cannot be refreshed (e.g., token invalid)
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.push('/login'); // Redirect to login page after logout
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);