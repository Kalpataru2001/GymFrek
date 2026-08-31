'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserContextValue {
  /** The Firestore user profile for the currently signed-in user. */
  profile: UserProfile | null;
  /** True while the profile is being fetched from Firestore. */
  loading: boolean;
  /**
   * Merges the supplied partial data into the user's Firestore profile document.
   * Also updates the local state immediately for an optimistic UI feel.
   */
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  /** Re-fetches the profile from Firestore and updates local state. */
  refreshProfile: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UserContext = createContext<UserContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Fetches the Firestore document at `users/{uid}` and updates local state.
   * Returns the fetched profile (or null if the document does not exist).
   */
  const fetchProfile = useCallback(
    async (uid: string): Promise<UserProfile | null> => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Sync profile whenever the Firebase auth user changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Wait until Firebase Auth has resolved its initial state
    if (authLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const fetched = await fetchProfile(user.uid);

        if (!cancelled) {
          if (fetched) {
            setProfile(fetched);
          } else {
            // Bootstrap a minimal profile from Firebase Auth data so the app
            // has something to work with before the user completes onboarding.
            const bootstrapped: UserProfile = {
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? '',
              photoURL: user.photoURL ?? '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            // Persist the bootstrapped profile so subsequent loads find it
            const ref = doc(db, 'users', user.uid);
            await setDoc(ref, bootstrapped, { merge: true });
            setProfile(bootstrapped);
          }
        }
      } catch (error) {
        console.error('[UserContext] Failed to fetch user profile:', error);
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, fetchProfile]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<void> => {
      if (!user) throw new Error('No authenticated user');

      const ref = doc(db, 'users', user.uid);
      const now = new Date().toISOString();
      const payload = { ...data, updatedAt: now } as Partial<UserProfile>;

      // Optimistic local update first for a snappy UI
      setProfile((prev) =>
        prev ? ({ ...prev, ...payload } as UserProfile) : null
      );

      await setDoc(ref, payload, { merge: true });
    },
    [user]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    setLoading(true);
    try {
      const fetched = await fetchProfile(user.uid);
      setProfile(fetched);
    } catch (error) {
      console.error('[UserContext] Failed to refresh user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------

  const value: UserContextValue = {
    profile,
    loading,
    updateProfile,
    refreshProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current user-profile context value.
 * Must be used inside <UserProvider>, which itself must be inside <AuthProvider>.
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
