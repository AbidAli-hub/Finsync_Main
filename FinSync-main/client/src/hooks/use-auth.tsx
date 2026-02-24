import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string; // Add phone number
  avatar?: string;
  sessionId?: string; // Add session tracking
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, company: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void; // Add updateUser function
  clearUserData: () => void; // Add method to clear all user-specific data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [, setLocation] = useLocation();

  // Helper function to clear session data but preserve user data
  const clearSessionData = () => {
    // Clear all authentication-related localStorage keys
    localStorage.removeItem("finsync_user");
    localStorage.removeItem("finsync_session_id");
    localStorage.removeItem("finsync_intro_seen");
    
    if (user?.id) {
      localStorage.removeItem(`finsync_user_${user.id}_session`);
    }
    
    // Clear sessionStorage completely
    sessionStorage.clear();
    
    // Clear user state
    setUser(null);
  };

  // Helper function to clear ALL user data (only for different users)
  const clearAllUserData = () => {
    // Clear user-specific localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('finsync_') || key.includes('user_') || key.includes('session_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear user state
    setUser(null);
  };

  // Generate unique session ID for user isolation
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    // Check for existing session on app start and validate with server
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("finsync_user");
      const currentSessionId = localStorage.getItem("finsync_session_id");
      
      if (savedUser && currentSessionId) {
        try {
          const user = JSON.parse(savedUser);
          // Validate the session with the server including session ID
          const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              userId: user.id, 
              sessionId: currentSessionId 
            }),
          });
          
          if (response.ok) {
            const { user: validatedUser } = await response.json();
            // Ensure session ID matches
            if (validatedUser.sessionId === currentSessionId) {
              setUser(validatedUser);
            } else {
              // Session mismatch, clear all user data
              clearAllUserData();
            }
          } else {
            // Invalid session, clear all user data
            clearAllUserData();
          }
        } catch (error) {
          // Clear invalid data if JSON parsing fails or network error
          clearAllUserData();
        }
      } else {
        // No saved user or session, ensure clean state
        clearAllUserData();
      }
      setIsLoading(false); // Always set loading to false after check
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Only clear session data, not user data (unless different user)
    clearSessionData();
    
    try {
      // Generate new session ID for this login
      const sessionId = generateSessionId();
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { user } = await response.json();
      
      // Check if this is a different user than before
      const previousUserId = localStorage.getItem('finsync_last_user_id');
      if (previousUserId && previousUserId !== user.id) {
        // Different user, clear all data from previous user
        clearAllUserData();
      }
      
      // Store user with session ID
      const userWithSession = { ...user, sessionId };
      setUser(userWithSession);
      
      // Store in localStorage with user-specific keys
      localStorage.setItem("finsync_user", JSON.stringify(userWithSession));
      localStorage.setItem("finsync_session_id", sessionId);
      localStorage.setItem(`finsync_user_${user.id}_session`, sessionId);
      localStorage.setItem('finsync_last_user_id', user.id); // Track last user
      
      setLocation("/dashboard");
    } catch (error) {
      clearSessionData(); // Clear session on error
      throw new Error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, company: string, phone?: string) => {
    setIsLoading(true);
    
    // Clear session data for registration
    clearSessionData();
    
    // Debug log to see what values are being passed
    console.log('Register function called with:', { email, password, name, company, phone });
    
    // Validate data before sending
    if (!email || typeof email !== 'string') {
      console.error('Invalid email in register function:', email);
      throw new Error('Invalid email address');
    }
    
    if (!password || typeof password !== 'string') {
      console.error('Invalid password in register function:', password);
      throw new Error('Invalid password');
    }
    
    if (!name || typeof name !== 'string') {
      console.error('Invalid name in register function:', name);
      throw new Error('Invalid name');
    }
    
    try {
      // Generate new session ID for this registration
      const sessionId = generateSessionId();
      
      // Only send user data fields that match the schema
      const userData = {
        email,
        password,
        name,
        company,
        phone
      };
      
      console.log('Sending user data to server:', userData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response status text:', response.statusText);
      
      // Log the raw response before checking if it's ok
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log('Registration raw response text:', responseText);
      
      if (!response.ok) {
        console.log('Registration failed with status:', response.status);
        // Use the cloned response for error handling
        let errorText = responseText;
        if (!errorText) {
          // If we couldn't get text from the clone, try the original response
          errorText = await response.text();
        }
        console.log('Registration error response body:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          // More specific error handling based on status code
          if (response.status === 400) {
            if (errorData.message && errorData.message.toLowerCase().includes('email')) {
              throw new Error(errorData.message); // Use the actual error message from server
            }
            throw new Error(errorData.message || 'Invalid registration data provided.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          }
          throw new Error(errorData.message || 'Registration failed');
        } catch (e) {
          if (e instanceof Error) {
            throw e;
          }
          throw new Error(errorText || 'Registration failed');
        }
      }

      const { user } = await response.json();
      console.log('Registration successful, received user:', user);
      
      // For new user registration, automatically log them in
      // This eliminates the need for a separate login step
      const userWithSession = { ...user, sessionId };
      
      // Set user state immediately
      setUser(userWithSession);
      
      // Store in localStorage with user-specific keys
      localStorage.setItem("finsync_user", JSON.stringify(userWithSession));
      localStorage.setItem("finsync_session_id", sessionId);
      localStorage.setItem(`finsync_user_${user.id}_session`, sessionId);
      localStorage.setItem('finsync_last_user_id', user.id); // Track last user
      
      // Navigate to dashboard immediately without requiring separate login
      setLocation("/dashboard");
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Registration error type:', typeof error);
      console.error('Registration error constructor:', (error as Error)?.constructor?.name);
      console.error('Registration error message:', (error as Error)?.message);
      console.error('Registration error stack:', (error as Error)?.stack);
      clearSessionData(); // Clear session on error
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update localStorage as well
      localStorage.setItem("finsync_user", JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    try {
      // Call server logout endpoint if user exists
      if (user?.id) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
      }
    } catch (error) {
      console.log('Server logout failed, continuing with client logout:', error);
    }
    
    // Clear all session data and user state
    clearSessionData();
    
    // Force a complete app reload to reset all state
    window.location.href = "/"; // This will trigger a complete reload
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      updateUser, // Add updateUser to context
      clearUserData: clearAllUserData // For emergency cleanup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}