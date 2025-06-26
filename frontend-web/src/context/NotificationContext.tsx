import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Define the structure of the notification object
interface Notification {
  message: string;
  type: string;
  timestamp: string; // Adjust this to match your backend timestamp format
}

interface NotificationContextType {
  notifications: Notification[]; // Updated to an array of Notification objects
  addNotification: (notification: Notification) => void; // Function now accepts a Notification object
  clearNotifications: () => void; // Add function to clear notifications
}

// Define the props type for NotificationProvider
interface NotificationProviderProps {
  children: ReactNode; // Specifies that children can be any valid React element
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]); // Store notifications as objects
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // Add a notification object
  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Fetch existing notifications on component mount
  useEffect(() => {
    const fetchExistingNotifications = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;
  
        // Update the URL to point to the deployed backend
        const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (response.ok) {
          const data = await response.json();
          
          // Filter for the 3 types of notifications
          const relevantNotifications = data.filter((notif: Notification) => 
            ["ADMIN_REQUEST", "USER_REGISTERED", "TASK_ADDED"].includes(notif.type)
          );
  
          setNotifications(relevantNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  
    fetchExistingNotifications();
  }, []);
  

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.log("No JWT token found, skipping WebSocket connection.");
      return;
    }

    const socket = new SockJS("https://it342-g5-collaboraid.onrender.com/ws");

    
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket for notifications");

        // Subscribe to the notifications topic
        client.subscribe("/topic/notifications", (message) => {
          if (message.body) {
            try {
              const notificationData: Notification = JSON.parse(message.body);
              console.log("Received notification:", notificationData);
              
              // Only add admin request notifications
              if (["ADMIN_REQUEST", "USER_REGISTERED", "TASK_ADDED"].includes(notificationData.type)) {
                addNotification(notificationData);
              }
              
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket (notifications)");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};