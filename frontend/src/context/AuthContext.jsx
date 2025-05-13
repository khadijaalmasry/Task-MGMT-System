import { createContext, useContext, useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useLazyQuery, gql } from '@apollo/client';

const VERIFY_USER_QUERY = gql`
  query Me {
    me {
      _id
      name
      isAdmin
      universityId
    }
  }
`;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const client = useApolloClient();

  const [verifyUser] = useLazyQuery(VERIFY_USER_QUERY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      } else {
        logout(); // Invalid token
      }
    },
    onError: () => {
      logout(); // Also logout on failure
    }
  });


  const login = (token, userData, persist = false) => {
    if (persist) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    client.resetStore();
  };

  const isLoggedIn = !!token;

  // Verify token on initial load
  useEffect(() => {
    if (token && !user) {
      // You might want to verify the token here
      // or fetch user data from the server
      verifyUser();
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoggedIn,
      login, 
      logout, 
      isAdmin: user?.isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};