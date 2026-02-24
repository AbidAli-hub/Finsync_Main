import { ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useUserStorage } from "../hooks/use-user-storage";
import LoadingScreen from "./ui/loading-screen";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

/**
 * Component that ensures proper user isolation and authentication
 * Automatically cleans up data from other users/sessions
 */
export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  fallback = <LoadingScreen /> 
}: ProtectedRouteProps) {
  const { user, isLoading, clearUserData } = useAuth();
  const { clearAllUserData, isAuthenticated } = useUserStorage();

  useEffect(() => {
    // Clean up any data that doesn't belong to current user (but keep current user's data)
    const cleanupOtherUserData = () => {
      if (!user?.id) return;

      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('finsync_user_')) {
          try {
            // Check if this data belongs to a different user
            const parts = key.split('_');
            if (parts.length >= 3) {
              const keyUserId = parts[2];
              // Only remove data from OTHER users, not current user
              if (keyUserId !== user.id && keyUserId !== 'session') {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // If we can't parse it, it's probably corrupted - remove it
            keysToRemove.push(key);
          }
        }
      }

      // Remove data from other users only
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleaned up data from other user: ${key}`);
      });
    };

    if (user?.id) {
      cleanupOtherUserData();
    }
  }, [user?.id]); // Removed sessionId dependency

  // Show loading while checking authentication
  if (isLoading) {
    return fallback;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Clear any residual data
    clearUserData();
    return fallback;
  }

  // If user is authenticated but session is invalid, clear everything
  if (user && (!user.sessionId || !localStorage.getItem('finsync_session_id'))) {
    clearUserData();
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for wrapping components with user isolation
 */
export function withUserIsolation<P extends object>(
  Component: React.ComponentType<P>
) {
  return function IsolatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}