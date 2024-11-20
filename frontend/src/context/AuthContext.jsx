import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    return isAuthenticated === 'true' ? { name: 'Test User', email: 'test@example.com' } : null;
  });
  const [savedContracts, setSavedContracts] = useState([]);

  useEffect(() => {
    // Load saved contracts from localStorage on mount
    const saved = localStorage.getItem('savedContracts');
    if (saved) {
      setSavedContracts(JSON.parse(saved));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAuthenticated');
  };

  const saveContract = (contract) => {
    const updatedContracts = [...savedContracts, { ...contract, savedAt: new Date().toISOString() }];
    setSavedContracts(updatedContracts);
    localStorage.setItem('savedContracts', JSON.stringify(updatedContracts));
  };

  const unsaveContract = (contractId) => {
    const updatedContracts = savedContracts.filter(contract => contract.id !== contractId);
    setSavedContracts(updatedContracts);
    localStorage.setItem('savedContracts', JSON.stringify(updatedContracts));
  };

  const isContractSaved = (contractId) => {
    return savedContracts.some(contract => contract.id === contractId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      savedContracts,
      saveContract,
      unsaveContract,
      isContractSaved
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
