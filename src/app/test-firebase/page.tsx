"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Database, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "@/lib/store/profile";

export default function TestFirebasePage() {
  const { user, loading } = useAuth();
  const { credits, exp, level, isLoading: profileLoading } = useProfileStore();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'pending' }));
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: 'success' }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'error' }));
    }
  };

  const testFirebaseConnection = async () => {
    // Test basic Firebase connection
    const { auth } = await import('@/lib/firebase/config');
    if (!auth) throw new Error('Firebase auth not initialized');
  };

  const testProfileStore = async () => {
    // Test profile store functions
    const profileStore = useProfileStore.getState();
    profileStore.addCredits(1);
    profileStore.addCredits(-1); // Reset
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border border-gray-400" />;
    }
  };

  const tests = [
    {
      name: 'firebase-connection',
      title: 'Firebase Connection',
      description: 'Test basic Firebase SDK initialization',
      icon: Database,
      action: () => runTest('firebase-connection', testFirebaseConnection)
    },
    {
      name: 'profile-store',
      title: 'Profile Store',
      description: 'Test Zustand profile store functionality',
      icon: Users,
      action: () => runTest('profile-store', testProfileStore)
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Firebase Integration Test</h1>
        <p className="text-muted-foreground">
          Test Firebase services and verify the integration is working correctly
        </p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Authentication State</span>
              <Badge variant={loading ? "secondary" : user ? "default" : "destructive"}>
                {loading ? "Loading..." : user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            
            {user && (
              <>
                <div className="flex items-center justify-between">
                  <span>User ID</span>
                  <span className="font-mono text-sm">{user.uid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Display Name</span>
                  <span>{user.displayName || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <span>{user.email || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Provider</span>
                  <Badge variant="outline">{user.provider}</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Store Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profile Store Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{credits}</div>
              <div className="text-sm text-muted-foreground">Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{exp}</div>
              <div className="text-sm text-muted-foreground">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <Badge variant={profileLoading ? "secondary" : "default"}>
                {profileLoading ? "Loading" : "Ready"}
              </Badge>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Tests</CardTitle>
          <CardDescription>
            Run these tests to verify Firebase integration is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <test.icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-sm text-muted-foreground">{test.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults[test.name])}
                  <Button 
                    size="sm" 
                    onClick={test.action}
                    disabled={testResults[test.name] === 'pending'}
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Enable Authentication:</strong> Go to Firebase Console → Authentication → Sign-in method and enable Email/Password
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Create Firestore Database:</strong> Go to Firebase Console → Firestore Database → Create database
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Test Authentication:</strong> Try signing up with email/password on the login page
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}