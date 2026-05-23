import { createContext, useContext, useState, useEffect } from 'react';
import { joinUserRoom } from '../hooks/useAnalysisSocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);

  // On app load, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = JSON.parse(localStorage.getItem('user') || 'null');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      joinUserRoom(savedUser.id); // re-join socket room on refresh
    }
  }, []);

  const login = (tokenData, userData) => {
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user',  JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
    joinUserRoom(userData.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);