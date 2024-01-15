import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for authentication
const AuthContext = createContext({
    username: null,
    login: () => {},
    logout: () => {},
  });

// Create a provider component to manage authentication state
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    // Check if the user is already authenticated (e.g., via a token stored in localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData:object) => {
    // Perform your authentication logic here
    // Example: You might want to call an API to verify the user's credentials
    // For simplicity, we'll just set the user data directly
    setUser(userData);

    // Store the user data in localStorage to persist across page reloads
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Perform any necessary cleanup (e.g., clear tokens, reset state)
    setUser({});

    // Remove user data from localStorage
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to access the authentication context
export const useAuth = () => useContext(AuthContext);
