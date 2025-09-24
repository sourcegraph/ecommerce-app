// Generate a unique session ID for cart popularity tracking
export const getSessionId = (): string => {
  // Check if we already have a session ID stored
  let sessionId = localStorage.getItem('ecommerce-session-id');
  
  if (!sessionId) {
    // Generate a new UUID-like session ID
    sessionId = 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    localStorage.setItem('ecommerce-session-id', sessionId);
  }
  
  return sessionId;
};
