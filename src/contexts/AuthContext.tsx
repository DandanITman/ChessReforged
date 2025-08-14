"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AuthUser, UserProfile, getUserProfile, updateLastActive } from '@/lib/firebase/auth';
import { useProfileStore, setCurrentUserRef } from '@/lib/store/profile';
import { useEditorStore, setCurrentUserUidRef } from '@/lib/store/editor';
import { PlayerCountService } from '@/lib/firebase/playerCount';
import DisplayNamePrompt from '@/components/DisplayNamePrompt';

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsDisplayName: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);

  // Convert Firebase User to AuthUser
  const convertFirebaseUser = (firebaseUser: User): AuthUser => {
    // Determine provider from providerData
    let provider: 'google' | 'apple' | 'discord' | 'email' = 'email';
    
    if (firebaseUser.providerData.length > 0) {
      const providerId = firebaseUser.providerData[0].providerId;
      if (providerId === 'google.com') provider = 'google';
      else if (providerId === 'apple.com') provider = 'apple';
      else if (providerId.includes('discord')) provider = 'discord';
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      provider
    };
  };

  // Load user profile from Firestore
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const profile = await getUserProfile(firebaseUser);
      setUserProfile(profile);
      
      // Update last active timestamp
      await updateLastActive(firebaseUser.uid);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (auth.currentUser) {
      await loadUserProfile(auth.currentUser);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      // Remove from online players before signing out
      if (user) {
        await PlayerCountService.removeUserStatus(user.uid);
      }
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        const authUser = convertFirebaseUser(firebaseUser);
        setUser(authUser);
        
        // Set user reference for stores Firebase integration
        setCurrentUserRef({ uid: firebaseUser.uid });
        setCurrentUserUidRef(firebaseUser.uid);
        
        // Update user's online status
        await PlayerCountService.updateUserStatus(
          firebaseUser.uid,
          firebaseUser.displayName || 'Anonymous Player',
          'online'
        );
        
        // Load user profile from Firestore
        await loadUserProfile(firebaseUser);
        
        // Check if user needs to set display name (only for OAuth providers, not email)
        // Add a small delay to ensure profile updates have completed
        setTimeout(() => {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const isOAuthProvider = authUser.provider !== 'email';
            const needsName = isOAuthProvider && (!currentUser.displayName || currentUser.displayName.trim() === '');
            setNeedsDisplayName(needsName);
          }
        }, 1000); // 1 second delay to allow updates to complete
        
        // Sync stores with Firebase
        try {
          const profileStore = useProfileStore.getState();
          await profileStore.syncWithFirebase(firebaseUser.uid);
          
          const editorStore = useEditorStore.getState();
          await editorStore.syncWithFirebase(firebaseUser.uid);
        } catch (error) {
          console.error('Error syncing stores with Firebase:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setNeedsDisplayName(false);
        
        // Remove from online players if user was signed in
        if (user) {
          await PlayerCountService.removeUserStatus(user.uid);
        }
        
        // Clear user references
        setCurrentUserRef(null);
        setCurrentUserUidRef(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update last active every 5 minutes while user is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      if (document.visibilityState === 'visible' && user) {
        await updateLastActive(user.uid);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const handleDisplayNameComplete = (displayName: string) => {
    setNeedsDisplayName(false);
    // Refresh the auth state to get updated display name
    refreshProfile();
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    needsDisplayName,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {needsDisplayName && user && (
        <DisplayNamePrompt
          onComplete={handleDisplayNameComplete}
          userEmail={user.email}
        />
      )}
    </AuthContext.Provider>
  );
}

// Hook for checking if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  }, [user, loading]);

  return { user, loading };
}

// Hook for getting user profile data
export function useUserProfile() {
  const { userProfile, refreshProfile } = useAuth();
  return { userProfile, refreshProfile };
}