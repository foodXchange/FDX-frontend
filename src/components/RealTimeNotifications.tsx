// src/components/RealTimeNotifications.tsx
import React, { useState, useEffect } from 'react';
import websocketService from '../services/websocket';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    websocketService.on('compliance_alert', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: data.message,
        type: data.severity,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 latest
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={\p-4 rounded-md shadow-lg max-w-sm transition-all duration-300 \\}
        >
          <div className="flex items-start">
            <span className="mr-2 text-lg">
              {notification.type === 'error' ? '🚨' : 
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <p className="font-medium text-sm">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">{notification.timestamp}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeNotifications;
