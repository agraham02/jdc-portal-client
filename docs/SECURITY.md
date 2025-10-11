# Security Documentation

## CSRF Protection Strategy

This application uses **JWT-based authentication** with automatic token refresh, which provides inherent CSRF protection through the following mechanisms:

### 1. JWT Tokens in Headers (Not Cookies)

- **Access tokens** are stored in memory (`session` service) and sent via `Authorization` header
- **Refresh tokens** are HTTP-only cookies (cannot be accessed by JavaScript)
- All state-changing API requests require the `Authorization: Bearer <token>` header
- This prevents CSRF attacks because:
  - Malicious sites cannot read tokens from JavaScript (due to Same-Origin Policy)
  - Malicious sites cannot set custom headers on cross-origin requests (due to CORS preflight)

### 2. CORS Configuration

The API server enforces strict CORS policies:
- Only whitelisted origins can make requests
- Credentials (`withCredentials: true`) are only allowed from trusted origins
- Preflight requests verify the origin before allowing state-changing operations

### 3. Device Fingerprinting

Each API request includes a unique device fingerprint (`X-Device-Id` header):
- Generated on first visit and stored in localStorage
- Helps detect suspicious authentication attempts from unknown devices
- Provides an additional layer of identity verification

### 4. Token Expiration and Rotation

- Access tokens expire after a short duration (typically 15 minutes)
- Refresh tokens have a longer expiration but are rotated on each refresh
- Expired tokens cannot be used for CSRF attacks

### 5. SameSite Cookie Attribute

Refresh tokens use `SameSite=Strict` (or `Lax`) attribute:
- Prevents cookies from being sent on cross-site requests
- Additional protection layer for the refresh token cookie

## Why Traditional CSRF Tokens Are Not Needed

Traditional CSRF protection (with CSRF tokens) is designed for **cookie-based session authentication**, where:
- Session cookies are automatically sent with every request
- Attackers can trigger authenticated requests without knowing the session cookie

In our **JWT-based architecture**:
- Tokens are NOT automatically sent (must be explicitly added to headers)
- Cross-origin requests cannot set custom headers without CORS approval
- Even if a malicious site triggers a request, it won't include the Authorization header

## Sensitive Data Handling

### Data NOT Stored on Client

To minimize attack surface, the following sensitive data is NEVER stored in client-side state:

- ✅ User passwords (only sent in API requests, never stored)
- ✅ Refresh tokens (HTTP-only cookies, inaccessible to JavaScript)
- ✅ API keys or secrets
- ✅ Unencrypted payment information
- ✅ Social Security Numbers or Tax IDs
- ✅ Full credit card numbers

### Data Stored on Client (Non-Sensitive)

- Access tokens (in memory only, cleared on logout)
- User profile information (name, email, account type)
- User permissions and roles (for UI rendering)
- Device fingerprint (random UUID for request tracking)
- UI preferences (theme, language)

### Best Practices

1. **Never log sensitive data**: Ensure logger doesn't capture passwords or tokens
2. **Clear on logout**: All user data is cleared from memory when logging out
3. **Minimize exposure**: Only fetch data that's needed for the current view
4. **Type safety**: Use TypeScript to enforce which fields are included in client types

## Additional Security Measures

### Content Security Policy (CSP)

Recommended CSP headers for Next.js deployment:

\`\`\`
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.yourdomain.com wss://api.yourdomain.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
\`\`\`

### XSS Prevention

1. **DOMPurify Sanitization**: All user-generated content is sanitized before rendering
2. **React Default Escaping**: React automatically escapes values in JSX
3. **Dangerous HTML**: Only use `dangerouslySetInnerHTML` with sanitized content

### Authentication Security Checklist

- [x] Access tokens stored in memory (not localStorage or cookies)
- [x] Refresh tokens in HTTP-only cookies
- [x] Automatic token refresh on 401 responses
- [x] Device fingerprinting for request tracking
- [x] JWT expiration and rotation
- [x] User-generated content sanitization (DOMPurify)
- [x] CORS enforcement on API server
- [ ] CSP headers (to be configured in production)
- [ ] Rate limiting on authentication endpoints
- [ ] Account lockout after failed login attempts

## Deployment Recommendations

### Next.js Middleware

Consider adding security headers in `middleware.ts`:

\`\`\`typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}
\`\`\`

### Environment Variables

Ensure these are set in production:

- `NEXT_PUBLIC_API_URL`: Full API URL (e.g., `https://api.yourdomain.com`)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (e.g., `wss://api.yourdomain.com`)
- `NODE_ENV=production`: Disables debug logs and enables optimizations

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
