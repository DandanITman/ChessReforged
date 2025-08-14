"use client";

import { create } from "zustand";
import type { Achievement } from "@/lib/store/profile";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

export interface AchievementNotificationData {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  achievementNotifications: AchievementNotificationData[];
  
  // Regular notification actions
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  
  // Achievement notification actions
  showAchievementNotification: (achievement: Achievement) => void;
  dismissAchievementNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  achievementNotifications: [],

  addNotification(notification) {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newNotification: Notification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },

  removeNotification(id) {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  showAchievementNotification(achievement: Achievement) {
    const notification: AchievementNotificationData = {
      id: `achievement_${achievement.id}_${Date.now()}`,
      achievement,
      timestamp: Date.now(),
    };

    set((state) => ({
      achievementNotifications: [...state.achievementNotifications, notification],
    }));

    console.log('🏆 Achievement Unlocked:', achievement.title);
  },

  dismissAchievementNotification(id: string) {
    set((state) => ({
      achievementNotifications: state.achievementNotifications.filter(n => n.id !== id),
    }));
  },

  clearAllNotifications() {
    set({ notifications: [], achievementNotifications: [] });
  },
}));
