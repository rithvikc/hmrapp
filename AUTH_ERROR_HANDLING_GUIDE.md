# Authentication Error Handling Guide

## Overview

This guide explains how the application handles authentication errors, particularly the "Invalid Refresh Token: Refresh Token Not Found" error, and provides comprehensive error recovery mechanisms.

## The Problem

The `AuthApiError: Invalid Refresh Token: Refresh Token Not Found` error typically occurs when:

1. **Session Expiration**: The user's authentication session has expired
2. **Token Corruption**: The refresh token stored in localStorage becomes corrupted
3. **Browser Storage Issues**: localStorage/sessionStorage data becomes inconsistent
4. **Network Issues**: Intermittent connectivity during token refresh
5. **Multiple Tab Issues**: Conflicting auth states across browser tabs

## Solution Implementation

### 1. Enhanced AuthContext (`src/contexts/AuthContext.tsx`)

**Key Features**:
- **Comprehensive Error Handling**: Detects and handles various refresh token error patterns
- **Automatic Session Cleanup**: Clears corrupted auth data automatically
- **Graceful Fallbacks**: Provides fallback mechanisms when auth operations fail
- **State Management**: Maintains consistent auth state across the application

**Error Detection Patterns**:
```typescript
const errorMessage = error?.message || ''
const isAuthError = errorMessage.includes('refresh_token_not_found') || 
                   errorMessage.includes('Invalid Refresh Token') ||
                   errorMessage.includes('Refresh Token Not Found') ||
                   errorMessage.includes('AuthApiError') ||
                   errorMessage.includes('invalid_grant')
```

**Recovery Actions**:
- Clear all Supabase auth tokens from localStorage
- Clear session storage data
- Reset auth state to null
- Display user-friendly error messages
- Redirect to login when appropriate

### 2. Enhanced ErrorBoundary (`src/components/ErrorBoundary.tsx`)

**Key Features**:
- **Global Error Catching**: Catches unhandled auth errors throughout the app
- **Smart Error Classification**: Distinguishes between auth errors and other errors
- **Storage Cleanup**: Automatically clears corrupted auth data
- **User-Friendly UI**: Provides clear error messages and recovery options
- **Development Support**: Shows detailed error information in development mode

**Storage Cleanup Logic**:
```typescript
// Clear all potential auth storage
localStorage.removeItem('sb-prcqfrmocyrbiqbbytcd-auth-token')
localStorage.removeItem('supabase.auth.token')
sessionStorage.removeItem('selectedPlan')

// Clear any other Supabase auth keys
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
    localStorage.removeItem(key)
  }
})
```

### 3. Enhanced Login Page (`src/app/login/page.tsx`)

**Key Features**:
- **Session Expired Detection**: Detects when users are redirected due to expired sessions
- **Clear User Messaging**: Shows specific messages for session expiration
- **URL Parameter Handling**: Processes error parameters from redirects
- **State Reset**: Clears error states when users start typing

**Session Expired Notice**:
```typescript
{sessionExpired && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
    <div className="flex items-center">
      <Clock className="h-5 w-5 text-amber-600 mr-2" />
      <div>
        <h4 className="text-sm font-medium text-amber-800">Session Expired</h4>
        <p className="text-sm text-amber-700 mt-1">
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
      </div>
    </div>
  </div>
)}
```

## Error Flow Diagram

```
User Action → Auth Error Occurs
     ↓
AuthContext Detects Error
     ↓
Error Classification
     ↓
Is Auth Error? → Yes → Clear Auth Storage
     ↓                      ↓
     No                Set Error Message
     ↓                      ↓
Normal Error          Redirect to Login
Handling                   ↓
     ↓                Show Session Expired
ErrorBoundary              Notice
Catches Error              ↓
     ↓                User Signs In Again
Show Generic               ↓
Error UI              Auth State Restored
```

## Prevention Strategies

### 1. Proactive Token Management
- Monitor token expiration times
- Refresh tokens before they expire
- Handle network interruptions gracefully

### 2. Storage Management
- Regularly validate stored auth data
- Clear corrupted data automatically
- Use consistent storage keys

### 3. User Experience
- Provide clear error messages
- Offer easy recovery paths
- Maintain user context when possible

## Testing the Implementation

### Manual Testing Steps

1. **Simulate Session Expiration**:
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   // Then try to navigate to a protected page
   ```

2. **Corrupt Auth Data**:
   ```javascript
   // In browser console
   localStorage.setItem('supabase.auth.token', 'invalid-token')
   // Then try to perform an authenticated action
   ```

3. **Network Interruption**:
   - Disconnect internet during token refresh
   - Reconnect and observe error handling

### Expected Behaviors

1. **Error Detection**: Auth errors are caught and classified correctly
2. **Storage Cleanup**: Corrupted data is cleared automatically
3. **User Redirection**: Users are redirected to login with clear messaging
4. **State Recovery**: Auth state is properly reset after errors
5. **User Experience**: Clear, helpful error messages are displayed

## Troubleshooting Common Issues

### Issue: Error Still Occurs After Implementation
**Solution**:
1. Clear all browser data (localStorage, sessionStorage, cookies)
2. Restart the development server
3. Check browser console for any remaining error patterns
4. Verify Supabase configuration

### Issue: Users Get Stuck in Error Loop
**Solution**:
1. Check ErrorBoundary is properly clearing storage
2. Verify login page is handling session expired parameter
3. Ensure auth state is properly reset in AuthContext

### Issue: Error Handling Too Aggressive
**Solution**:
1. Review error detection patterns
2. Add more specific error classification
3. Implement retry mechanisms for transient errors

## Configuration Requirements

### Environment Variables
Ensure these are properly set:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Configuration
- Verify JWT expiration settings
- Check refresh token configuration
- Ensure proper CORS settings

## Monitoring and Logging

### Development
- Console logs show detailed error information
- Error boundary displays stack traces
- Auth state changes are logged

### Production
- Errors are logged but sensitive information is hidden
- User-friendly messages are displayed
- Recovery paths are clearly indicated

## Best Practices

1. **Always Handle Auth Errors**: Never let auth errors crash the application
2. **Clear Storage on Errors**: Remove corrupted data immediately
3. **Provide Clear Messaging**: Tell users what happened and what to do
4. **Test Error Scenarios**: Regularly test error handling paths
5. **Monitor Error Patterns**: Track common error types and frequencies

## Future Enhancements

1. **Retry Mechanisms**: Implement automatic retry for transient errors
2. **Offline Support**: Handle auth errors when offline
3. **Analytics Integration**: Track error patterns for improvement
4. **Progressive Recovery**: Attempt to recover without full logout when possible

This implementation provides robust error handling that gracefully recovers from authentication errors while maintaining a good user experience. 