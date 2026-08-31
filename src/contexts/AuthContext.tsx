'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated Firebase user, or null if not signed in. */
  user: User | null;
  /** True while the auth state is being determined on initial load. */
  loading: boolean;
  /** Sign in with Google via popup. */
  signInWithGoogle: () => Promise<User>;
  /** Sign in with email and password. */
  signInWithEmail: (email: string, password: string) => Promise<User>;
  /**
   * Register a new user with email, password and display name.
   * Updates the Firebase Auth profile with the provided name immediately.
   */
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<User>;
  /** Sign the current user out. */
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
        } catch {
          // ignore cookie error
        }
      } else {
        document.cookie = '__session=; path=/; max-age=0; SameSite=Lax';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    // Request additional scopes so we reliably get the user's profile photo
    provider.addScope('profile');
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<User> => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string): Promise<User> => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Immediately apply the display name so downstream contexts can read it
      await updateProfile(result.user, { displayName: name });
      // Force a state refresh so the updated user object propagates
      setUser({ ...result.user, displayName: name } as User);
      return result.user;
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    await firebaseSignOut(auth);
  }, []);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current auth context value.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
