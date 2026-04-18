import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://127.0.0.1:8001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount (fallback if offline)
    const savedUser = localStorage.getItem('crediVisionUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const signup = async (phone, email, name) => {
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, name }),
      });

      if (!response.ok) {
        throw new Error(`Signup failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok && data.user) {
        // Store user info for persistence
        localStorage.setItem('crediVisionUser', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        throw new Error(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Fallback to mock user if API fails
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        email,
        name,
        kyc_status: 'pending',
        verification_status: 'pending',
        offer_status: 'pending',
        eligibility_status: 'pending',
        created_at: new Date().toISOString(),
        credit_score: 750,
        pre_approved_limit: 300000,
      };
      localStorage.setItem('crediVisionUser', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  const login = async (phone, otp) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok && data.user) {
        localStorage.setItem('crediVisionUser', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('crediVisionUser');
    setUser(null);
  };

  const updateUserStatus = async (phone, statusType, statusValue) => {
    try {
      const response = await fetch(`${API_URL}/api/user/${phone}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_type: statusType, status_value: statusValue }),
      });

      if (!response.ok) {
        throw new Error('Status update failed');
      }

      const data = await response.json();
      if (data.ok) {
        // Refresh user from latest timeline
        return await getUserTimeline(phone);
      }
    } catch (error) {
      console.error('Update status error:', error);
      // Fallback: update local state
      if (user && user.phone === phone) {
        const updated = { ...user, [statusType]: statusValue };
        localStorage.setItem('crediVisionUser', JSON.stringify(updated));
        setUser(updated);
        return updated;
      }
    }
  };

  const getUserTimeline = async (phone) => {
    try {
      const response = await fetch(`${API_URL}/api/application-timeline/${phone}`);
      if (!response.ok) {
        throw new Error('Timeline fetch failed');
      }

      const data = await response.json();
      if (data.ok && data.user) {
        // Update local state with latest user data
        localStorage.setItem('crediVisionUser', JSON.stringify(data.user));
        setUser(data.user);
        return data;
      }
    } catch (error) {
      console.error('Get timeline error:', error);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUserStatus, getUserTimeline }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
