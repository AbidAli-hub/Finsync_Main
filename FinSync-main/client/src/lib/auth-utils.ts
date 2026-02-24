// Clear authentication data utility
export const clearAuthData = () => {
  localStorage.removeItem("finsync_user");
  localStorage.removeItem("finsync_intro_seen");
  sessionStorage.clear();
};

// Force logout utility
export const forceLogout = () => {
  clearAuthData();
  window.location.href = "/auth";
};