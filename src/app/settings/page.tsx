"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Lock,
  MapPin,
  Image,
  FileText,
  Bell,
  Volume2,
  Eye,
  Globe,
  Shield,
  Palette,
  Monitor,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Save,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function SettingsPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  // State for form inputs - initialize with real user data
  const [settings, setSettings] = React.useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    bio: "",
    location: "",
    timezone: "America/New_York",
    language: "English",
    theme: userProfile?.settings?.theme || "dark",
    soundEnabled: userProfile?.settings?.soundEnabled ?? true,
    notificationsEnabled: userProfile?.settings?.notifications ?? true,
    gameInvites: true,
    friendRequests: true,
    achievements: true,
    boardTheme: "classic",
    pieceSet: "traditional",
    animationSpeed: "normal",
    showCoordinates: true,
    highlightMoves: true,
    autoQueen: false,
    confirmMoves: false,
    privacy: "public",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (user && userProfile) {
      setSettings(prev => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.email || "",
        bio: "",
        theme: userProfile.settings?.theme || "dark",
        soundEnabled: userProfile.settings?.soundEnabled ?? true,
        notificationsEnabled: userProfile.settings?.notifications ?? true,
      }));
    }
  }, [user, userProfile]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update Firebase Auth profile
      if (settings.displayName !== user.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: settings.displayName
        });
      }

      // Update password if provided
      if (settings.newPassword && settings.currentPassword && auth.currentUser) {
        if (settings.newPassword !== settings.confirmPassword) {
          throw new Error("New passwords don't match");
        }
        if (settings.newPassword.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        
        // In a real app, you'd re-authenticate first
        await updatePassword(auth.currentUser, settings.newPassword);
      }

      // Update user profile in Firestore
      // This would require updating the ProfileSync service
      
      await refreshProfile();
      setSuccess("Settings saved successfully!");
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    alert("Export functionality would be implemented here");
  };

  const handleDownloadHistory = () => {
    alert("Download game history functionality would be implemented here");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion functionality would be implemented here");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Customize your Chess Reforged experience and manage your account preferences.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Settings */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your public profile and personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="size-20 ring-4 ring-primary/20">
                {user.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="flex items-center gap-2" disabled>
                  <Camera className="h-4 w-4" />
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground">
                  Avatar functionality coming soon
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter display name"
                />
                <p className="text-xs text-muted-foreground">How others see your name</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
                  placeholder="Email address"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location (Optional)</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter your location"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <input
                  type="text"
                  value={user.provider === 'email' ? 'Email Account' : `${user.provider.charAt(0).toUpperCase() + user.provider.slice(1)} Account`}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background h-24 resize-none"
                placeholder="Tell others about yourself..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {settings.bio.length}/200 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>Manage your account security and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.provider === 'email' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <input
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <input
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <input
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Password changes are not available for {user.provider} accounts.
                  Manage your password through your {user.provider} account settings.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Profile Visibility</div>
                  <div className="text-sm text-muted-foreground">Control who can see your profile</div>
                </div>
                <select
                  value={settings.privacy}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your regional and language settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                  <option value="Russian">Русский</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'notificationsEnabled', label: 'Enable Notifications', desc: 'Receive all notifications' },
              { key: 'gameInvites', label: 'Game Invitations', desc: 'When someone invites you to play' },
              { key: 'friendRequests', label: 'Friend Requests', desc: 'When someone wants to be your friend' },
              { key: 'achievements', label: 'Achievement Unlocks', desc: 'When you earn new achievements' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Game Appearance
            </CardTitle>
            <CardDescription>Customize how the game looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Board Theme</label>
                <select
                  value={settings.boardTheme}
                  onChange={(e) => handleInputChange('boardTheme', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="classic">Classic Wood</option>
                  <option value="marble">Marble</option>
                  <option value="metal">Metal</option>
                  <option value="neon">Neon</option>
                  <option value="glass">Glass</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Piece Set</label>
                <select
                  value={settings.pieceSet}
                  onChange={(e) => handleInputChange('pieceSet', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="3d">3D Rendered</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Animation Speed</label>
                <select
                  value={settings.animationSpeed}
                  onChange={(e) => handleInputChange('animationSpeed', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="instant">Instant</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'soundEnabled', label: 'Sound Effects', desc: 'Play sounds for moves and captures' },
                { key: 'showCoordinates', label: 'Show Coordinates', desc: 'Display board coordinates (a-h, 1-8)' },
                { key: 'highlightMoves', label: 'Highlight Legal Moves', desc: 'Show possible moves when selecting a piece' },
                { key: 'autoQueen', label: 'Auto-Queen Promotion', desc: 'Automatically promote pawns to queens' },
                { key: 'confirmMoves', label: 'Confirm Moves', desc: 'Require confirmation before making moves' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onChange={(e) => handleInputChange(item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="card-hover border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>Manage your account and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1" onClick={handleExportData}>
                Export Data
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDownloadHistory}>
                Download Game History
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Account deletion is permanent and cannot be undone. All your games, achievements, and data will be lost.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="text-center space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-900/50 border border-red-700 max-w-md mx-auto">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 rounded-md bg-green-900/50 border border-green-700 max-w-md mx-auto">
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            size="lg"
            className="px-8 py-4 text-lg gradient-card text-white border-0"
            disabled={isLoading}
          >
            <Save className="h-5 w-5 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
