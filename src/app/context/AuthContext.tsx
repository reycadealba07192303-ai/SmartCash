import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE } from '../../config/api';

interface User {
    id: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    fullName?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and user on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            
            // Sync user state with backend to catch premium upgrades
            fetch(`${API_BASE}/api/auth/profile`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            })
            .then(res => res.json())
            .then(data => {
                const userId = data._id || data.id;
                if (data && userId) {
                    const updatedUser = {
                        id: userId,
                        email: data.email,
                        role: data.role,
                        full_name: data.full_name,
                        school_id: data.school_id,
                        grade_level: data.grade_level,
                        strand: data.strand,
                        isPremium: data.isPremium
                    };
                    setUser(updatedUser as any);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            })
            .catch(err => console.error('Failed to sync user data', err));
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        // Note: Navigate should be handled by the component calling logout or via useEffect in a higher level component if needed
        // But since we are in a provider, we can't easily use useNavigate here unless we are inside Router.
        // Usually AuthProvider is inside Router in App.tsx.
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
