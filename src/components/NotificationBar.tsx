import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertTriangle, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveNotifications, Notification } from '@/lib/database';

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const activeNotifications = await getActiveNotifications();
        setNotifications(activeNotifications);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  // Se não houver notificações ou estiver carregando, não mostrar o componente
  if ((notifications.length === 0 && !loading) || !showNotification) {
    return null;
  }

  const currentNotification = notifications[currentIndex];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? notifications.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === notifications.length - 1 ? 0 : prev + 1));
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  return (
    <div className={`${loading ? 'animate-pulse' : ''}`}>
      {loading ? (
        <div className="flex items-center justify-center py-3 px-4 bg-gray-100 border-b border-gray-200">
          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-3"></div>
          <div className="h-4 w-64 bg-gray-300 rounded"></div>
        </div>
      ) : (
        <div className={`border-b ${getNotificationColor(currentNotification.type)}`}>
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center flex-1">
                <span className="flex p-2 rounded-lg">
                  {getNotificationIcon(currentNotification.type)}
                </span>
                <p className="ml-3 font-medium text-sm truncate">
                  <span>{currentNotification.title}: </span>
                  <span className="text-gray-600">{currentNotification.message}</span>
                </p>
              </div>
              
              {notifications.length > 1 && (
                <div className="flex items-center">
                  <button 
                    onClick={handlePrevious}
                    className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-xs text-gray-600 mx-2">
                    {currentIndex + 1}/{notifications.length}
                  </span>
                  <button 
                    onClick={handleNext}
                    className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
              
              <div className="order-2 flex-shrink-0 sm:ml-3">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Dispensar</span>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 