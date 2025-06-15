import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
const mockAuth = {
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  }))
};

const mockSupabase = {
  auth: mockAuth,
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    upsert: vi.fn()
  }))
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn()
  })
}));

// Import the auth context after mocking
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Sign Up', () => {
    it('should successfully create a new user account', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@pharmacy.com',
        email_confirmed_at: new Date().toISOString()
      };

      const mockPharmacist = {
        id: 'pharmacist-id',
        user_id: 'test-user-id',
        name: 'Dr. Test Pharmacist',
        email: 'test@pharmacy.com',
        registration_number: 'RN12345'
      };

      // Mock successful signup
      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock pharmacist record creation
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockPharmacist,
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      const signUpData = {
        name: 'Dr. Test Pharmacist',
        registration_number: 'RN12345',
        phone: '+1234567890',
        practice: 'Test Pharmacy',
        location: '123 Test St'
      };

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          'test@pharmacy.com',
          'password123',
          signUpData
        );
      });

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@pharmacy.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Dr. Test Pharmacist',
            ...signUpData
          }
        }
      });

      expect(signUpResult).toEqual({
        data: { user: mockUser },
        error: null
      });
    });

    it('should handle signup errors gracefully', async () => {
      const signUpError = {
        message: 'Email already registered'
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: signUpError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          'existing@pharmacy.com',
          'password123',
          { name: 'Test' }
        );
      });

      expect(signUpResult).toEqual({
        data: { user: null },
        error: signUpError
      });
    });

    it('should handle pharmacist record creation failure', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@pharmacy.com',
        email_confirmed_at: new Date().toISOString()
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock pharmacist creation error
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          'test@pharmacy.com',
          'password123',
          { name: 'Test Pharmacist' }
        );
      });

      expect(signUpResult).toEqual({
        data: null,
        error: {
          message: 'Account created but profile setup failed. Please contact support.'
        }
      });
    });

    it('should handle email confirmation flow', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@pharmacy.com',
        email_confirmed_at: null // Not confirmed yet
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp(
          'test@pharmacy.com',
          'password123',
          { name: 'Test Pharmacist' }
        );
      });

      expect(signUpResult).toEqual({
        data: { user: mockUser },
        error: null
      });
    });
  });

  describe('Sign In', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@pharmacy.com'
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          'test@pharmacy.com',
          'password123'
        );
      });

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@pharmacy.com',
        password: 'password123'
      });

      expect(signInResult).toEqual({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      });
    });

    it('should handle invalid credentials', async () => {
      const signInError = {
        message: 'Invalid login credentials'
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: signInError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          'wrong@pharmacy.com',
          'wrongpassword'
        );
      });

      expect(signInResult).toEqual({
        data: { user: null, session: null },
        error: signInError
      });
    });

    it('should handle network errors during sign in', async () => {
      mockAuth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn(
          'test@pharmacy.com',
          'password123'
        );
      });

      expect(signInResult).toEqual({
        data: null,
        error: {
          message: 'Network error'
        }
      });
    });
  });

  describe('Google Sign In', () => {
    it('should initiate Google OAuth flow', async () => {
      const mockOAuthResponse = {
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null
      };

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      });

      mockAuth.signInWithOAuth.mockResolvedValue(mockOAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signInWithGoogle();
      });

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/dashboard'
        }
      });

      expect(signInResult).toEqual(mockOAuthResponse);
    });

    it('should handle Google OAuth errors', async () => {
      const oauthError = {
        message: 'OAuth provider error'
      };

      mockAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: oauthError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signInWithGoogle();
      });

      expect(signInResult).toEqual({
        data: null,
        error: oauthError
      });
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const mockResetResponse = {
        data: {},
        error: null
      };

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      });

      mockAuth.resetPasswordForEmail.mockResolvedValue(mockResetResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword('test@pharmacy.com');
      });

      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@pharmacy.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password'
        }
      );

      expect(resetResult).toEqual(mockResetResponse);
    });

    it('should handle password reset errors', async () => {
      const resetError = {
        message: 'User not found'
      };

      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: resetError
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword('nonexistent@pharmacy.com');
      });

      expect(resetResult).toEqual({
        data: null,
        error: resetError
      });
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out user', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      mockAuth.signOut.mockRejectedValue(new Error('Sign out failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should not throw
      await act(async () => {
        await result.current.signOut();
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should handle initial session check', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@pharmacy.com'
      };

      const mockSession = {
        user: mockUser,
        access_token: 'token'
      };

      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Mock pharmacist fetch
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { id: 'pharmacist-id', name: 'Test Pharmacist' },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle session with invalid refresh token', async () => {
      const refreshTokenError = {
        message: 'refresh_token_not_found'
      };

      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: refreshTokenError
      });

      mockAuth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });
  });

  describe('Loading States', () => {
    it('should start with loading true and set to false after initialization', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
    });
  });
}); 