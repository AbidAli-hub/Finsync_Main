import { useAuth } from "./use-auth";

/**
 * Hook for managing user-specific data storage
 * Ensures complete data isolation between different users
 */
export function useUserStorage() {
  const { user } = useAuth();

  const getUserKey = (key: string): string => {
    if (!user?.id) {
      throw new Error("User must be authenticated to access user-specific storage");
    }
    return `finsync_user_${user.id}_${key}`;
  };

  const setUserData = (key: string, value: any): void => {
    try {
      const userKey = getUserKey(key);
      const serializedValue = JSON.stringify({
        data: value,
        userId: user?.id,
        sessionId: user?.sessionId, // Store but don't validate against it
        timestamp: Date.now()
      });
      localStorage.setItem(userKey, serializedValue);
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  };

  const getUserData = <T = any>(key: string, defaultValue?: T): T | null => {
    try {
      const userKey = getUserKey(key);
      const serializedData = localStorage.getItem(userKey);
      
      if (!serializedData) {
        return defaultValue || null;
      }

      const parsedData = JSON.parse(serializedData);
      
      // Only verify the data belongs to the current user (not session)
      // Sessions should be temporary, but user data should persist
      if (parsedData.userId !== user?.id) {
        // Data belongs to different user, remove it
        localStorage.removeItem(userKey);
        return defaultValue || null;
      }

      return parsedData.data;
    } catch (error) {
      console.error("Failed to retrieve user data:", error);
      return defaultValue || null;
    }
  };

  const removeUserData = (key: string): void => {
    try {
      const userKey = getUserKey(key);
      localStorage.removeItem(userKey);
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  };

  const clearAllUserData = (): void => {
    if (!user?.id) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`finsync_user_${user.id}_`)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const getUserDataKeys = (): string[] => {
    if (!user?.id) return [];

    const userKeys: string[] = [];
    const prefix = `finsync_user_${user.id}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Remove the prefix to get the original key
        userKeys.push(key.substring(prefix.length));
      }
    }

    return userKeys;
  };

  return {
    setUserData,
    getUserData,
    removeUserData,
    clearAllUserData,
    getUserDataKeys,
    isAuthenticated: !!user?.id
  };
}