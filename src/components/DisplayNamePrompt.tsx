"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Crown } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface DisplayNamePromptProps {
  onComplete: (displayName: string) => void;
  userEmail?: string | null;
}

export default function DisplayNamePrompt({ onComplete, userEmail }: DisplayNamePromptProps) {
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }

    if (displayName.trim().length > 20) {
      setError("Display name must be 20 characters or less");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim()
        });
      }
      
      onComplete(displayName.trim());
    } catch (error) {
      console.error("Error updating display name:", error);
      setError("Failed to update display name. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getSuggestedName = () => {
    if (userEmail) {
      const emailPrefix = userEmail.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return "";
  };

  const handleUseSuggestion = () => {
    const suggestion = getSuggestedName();
    if (suggestion) {
      setDisplayName(suggestion);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-xl">Welcome to Chess Reforged!</CardTitle>
          </div>
          <CardDescription>
            Choose a display name to complete your profile setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  maxLength={20}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {getSuggestedName() && displayName !== getSuggestedName() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseSuggestion}
                  className="text-xs"
                >
                  Use &ldquo;{getSuggestedName()}&rdquo;
                </Button>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !displayName.trim()}
              >
                {isSubmitting ? "Setting up..." : "Complete Setup"}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                You can change this later in your profile settings
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}