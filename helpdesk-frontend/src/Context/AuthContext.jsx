import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setUserId(localStorage.getItem("userId"));
      setUserEmail(localStorage.getItem("userEmail"));
      setUserRole(localStorage.getItem("userRole"));
    }
  }, []);

  const login = (authData) => {
    if (typeof authData === "string") {
      localStorage.setItem("token", authData);
      setToken(authData);
    } else if (authData && authData.token) {
      localStorage.setItem("token", authData.token);
      setToken(authData.token);
      
      if (authData.id) {
        localStorage.setItem("userId", authData.id.toString());
        setUserId(authData.id.toString());
      }
      if (authData.email) {
        localStorage.setItem("userEmail", authData.email);
        setUserEmail(authData.email);
      }
      if (authData.role) {
        localStorage.setItem("userRole", authData.role);
        setUserRole(authData.role);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userEmail,
        userRole,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);