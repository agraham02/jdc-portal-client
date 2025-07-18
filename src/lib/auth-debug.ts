// Debug utilities for authentication troubleshooting
// Only active in development or when explicitly enabled

// const DEBUG_ENABLED = 
//   process.env.NODE_ENV !== 'production' || 
//   process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true';
const DEBUG_ENABLED = true; // For demonstration purposes, always enabled

export class AuthDebugger {
  private static logPrefix = '[AUTH DEBUG]';

  static log(message: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    const timestamp = new Date().toISOString();
    console.log(`${this.logPrefix} ${timestamp} - ${message}`);
    if (data) {
      console.log(`${this.logPrefix} Data:`, data);
    }
  }

  static error(message: string, error?: any) {
    if (!DEBUG_ENABLED) return;
    
    const timestamp = new Date().toISOString();
    console.error(`${this.logPrefix} ${timestamp} - ERROR: ${message}`);
    if (error) {
      console.error(`${this.logPrefix} Error details:`, error);
    }
  }

  static warn(message: string, data?: any) {
    if (!DEBUG_ENABLED) return;
    
    const timestamp = new Date().toISOString();
    console.warn(`${this.logPrefix} ${timestamp} - WARNING: ${message}`);
    if (data) {
      console.warn(`${this.logPrefix} Data:`, data);
    }
  }

  static async testConnection() {
    if (!DEBUG_ENABLED) return null;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${baseUrl}/auth/debug/health`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      this.log('Backend connection test', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      return data;
    } catch (error) {
      this.error('Backend connection test failed', error);
      return null;
    }
  }

  static async debugHeaders(additionalData?: any) {
    if (!DEBUG_ENABLED) return null;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${baseUrl}/auth/debug/headers`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontendInfo: {
            userAgent: navigator.userAgent,
            currentUrl: window.location.href,
            origin: window.location.origin,
            timestamp: new Date().toISOString(),
            ...additionalData
          }
        })
      });
      
      const data = await response.json();
      this.log('Headers debug response', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      return data;
    } catch (error) {
      this.error('Headers debug failed', error);
      return null;
    }
  }

  static async testTokenInfo() {
    if (!DEBUG_ENABLED) return null;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${baseUrl}/auth/debug/token-info`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const data = await response.json();
      this.log('Token info debug response', {
        status: response.status,
        ok: response.ok,
        data,
        tokenFromStorage: token ? 'Present' : 'Not found'
      });
      
      return data;
    } catch (error) {
      this.error('Token info debug failed', error);
      return null;
    }
  }

  static logSessionState() {
    if (!DEBUG_ENABLED) return;
    
    this.log('Current session state', {
      localStorage: {
        accessToken: localStorage.getItem('accessToken') ? 'Present' : 'Not found',
        refreshToken: localStorage.getItem('refreshToken') ? 'Present' : 'Not found',
      },
      sessionStorage: {
        accessToken: sessionStorage.getItem('accessToken') ? 'Present' : 'Not found',
        refreshToken: sessionStorage.getItem('refreshToken') ? 'Present' : 'Not found',
      },
      cookies: document.cookie,
      currentUrl: window.location.href,
    });
  }

  static async runFullDiagnostic() {
    if (!DEBUG_ENABLED) return;
    
    this.log('=== STARTING FULL AUTH DIAGNOSTIC ===');
    
    // Test 1: Session state
    this.logSessionState();
    
    // Test 2: Backend connection
    await this.testConnection();
    
    // Test 3: Headers debug
    await this.debugHeaders({ diagnostic: true });
    
    // Test 4: Token info (if available)
    await this.testTokenInfo();
    
    this.log('=== FULL AUTH DIAGNOSTIC COMPLETE ===');
  }
}

// Global window access for easy debugging in production
if (typeof window !== 'undefined' && DEBUG_ENABLED) {
  (window as any).authDebug = AuthDebugger;
}
