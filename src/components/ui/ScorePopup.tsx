import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ScoreNotification } from '../../types/game';

const ScoreNotificationItem: React.FC<{ notification: ScoreNotification }> = ({ notification }) => {
  const removeScoreNotification = useGameStore((state) => state.removeScoreNotification);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      removeScoreNotification(notification.id);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [notification.id, removeScoreNotification]);

  return (
    <div
      className={`absolute text-xl sm:text-2xl font-black drop-shadow-lg animate-bounce transition-all duration-700 ${
        notification.isEco
          ? 'text-pink-400 [text-shadow:_0_0_15px_rgba(244,114,182,0.9)]'
          : 'text-amber-400 [text-shadow:_0_0_15px_rgba(250,204,21,0.9)]'
      }`}
      style={{
        transform: `translate(${notification.x * 25}px, -40px)`,
      }}
    >
      {notification.text} Punya!
    </div>
  );
};

export const ScorePopup: React.FC = () => {
  const { scoreNotifications } = useGameStore();

  if (scoreNotifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      {scoreNotifications.map((notif) => (
        <ScoreNotificationItem
          key={notif.id}
          notification={notif}
        />
      ))}
    </div>
  );
};
