import { useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Demo login - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const demoUser: User = {
      id: 'demo-1',
      name: 'Demo User',
      email: email,
      avatar: undefined,
    };
    
    setUser(demoUser);
    setIsLoading(false);
    return demoUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};

