import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    VIEWER: 'Viewer',
};

export const PERMISSIONS = {
    [ROLES.ADMIN]: ['read', 'create', 'update', 'delete', 'export'],
    [ROLES.MANAGER]: ['read', 'create', 'update', 'export'],
    [ROLES.VIEWER]: ['read'],
};

const USERS = [
    { id: 'U001', name: 'Priya Admin', role: ROLES.ADMIN, avatar: 'PA', email: 'admin@fleetflow.io', password: 'admin123' },
    { id: 'U002', name: 'Rohit Manager', role: ROLES.MANAGER, avatar: 'RM', email: 'manager@fleetflow.io', password: 'manager123' },
    { id: 'U003', name: 'Sara Viewer', role: ROLES.VIEWER, avatar: 'SV', email: 'viewer@fleetflow.io', password: 'viewer123' },
];

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);   // null = not logged in
    const [loginError, setLoginError] = useState('');

    const login = (email, password) => {
        const user = USERS.find(u => u.email === email && u.password === password);
        if (user) {
            const { password: _pw, ...safe } = user;
            setCurrentUser(safe);
            setLoginError('');
            return true;
        }
        setLoginError('Invalid email or password.');
        return false;
    };

    const logout = () => setCurrentUser(null);

    const can = (action) =>
        currentUser ? (PERMISSIONS[currentUser.role]?.includes(action) ?? false) : false;

    const switchUser = (userId) => {
        const user = USERS.find(u => u.id === userId);
        if (user) {
            const { password: _pw, ...safe } = user;
            setCurrentUser(safe);
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser, users: USERS, loginError,
            login, logout, can, switchUser,
            isAuthenticated: !!currentUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
