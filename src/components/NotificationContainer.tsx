"use client";

import React, { useEffect, useState } from "react";
import { useNotificationStore, type Notification } from "@/lib/store/notifications";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import AchievementNotification from "@/components/AchievementNotification";

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out",
        getBgColor(),
        isVisible && !isRemoving
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95",
        isRemoving && "opacity-0 translate-y-4 scale-90"
      )}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{notification.message}</p>
      <button
        onClick={handleRemove}
        className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const achievementNotifications = useNotificationStore((state) => state.achievementNotifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const dismissAchievementNotification = useNotificationStore((state) => state.dismissAchievementNotification);

  return (
    <>
      {/* Regular notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm w-full">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}

      {/* Achievement notifications */}
      {achievementNotifications.map((achievementNotif) => (
        <AchievementNotification
          key={achievementNotif.id}
          achievement={achievementNotif.achievement}
          onClose={() => dismissAchievementNotification(achievementNotif.id)}
        />
      ))}
    </>
  );
}
