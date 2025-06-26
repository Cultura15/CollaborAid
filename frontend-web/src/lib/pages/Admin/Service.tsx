import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Search, Phone, Video, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useUsers, fetchConversation, sendMessage as sendMessageApi } from "./MockData";
import { decodeToken } from "../JWTDecode/JWTDecode";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

export default function Service() {
  const users = useUsers();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? decodeToken(token) : null;
  const isAdmin = decodedToken?.role === "ADMIN";

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      const socket = new SockJS("https://it342-g5-collaboraid.onrender.com/ws");
      const stompClient = new Client({
        webSocketFactory: () => socket,
        brokerURL: "ws://localhost:8080/ws",
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => setIsWebSocketConnected(true),
        onStompError: (frame) => console.error("STOMP error:", frame),
        onDisconnect: () => setIsWebSocketConnected(false),
      });

      stompClient.activate();
      setClient(stompClient);

      return () => {
        stompClient.deactivate();
      };
    }
  }, [isAdmin]);

  useEffect(() => {
    if (client && selectedUser && isWebSocketConnected) {
      const subscription = client.subscribe(
        `/topic/messages/${selectedUser.id}`,
        (message) => {
          const messageData = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [client, selectedUser, isWebSocketConnected]);

  const fetchChatHistory = async () => {
    if (!selectedUser || !decodedToken) return;
    try {
      const data = await fetchConversation(decodedToken.id, selectedUser.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [selectedUser, decodedToken]);

  const handleSendMessage = async () => {
    if (messageInput.trim() === "" || !selectedUser || !decodedToken) return;

    const adminUser = {
      id: decodedToken.id,
      username: decodedToken.username,
      email: decodedToken.email,
      role: decodedToken.role,
    };

    const newMessage: Message = {
      id: messages.length + 1,
      senderId: adminUser.id,
      receiverId: selectedUser.id,
      content: messageInput,
      timestamp: new Date(),
    };

    const messagePayload = {
      sender: adminUser,
      receiver: {
        id: selectedUser.id,
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
      },
      content: messageInput,
    };

    try {
      await sendMessageApi(messagePayload);

      // Update local state after the message is sent
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageInput(""); // Clear the input after sending
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Filter out admins from the user list
  const filteredUsers = users.filter(
    (user) => user.role !== "ADMIN" && (user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Scroll to bottom when messages change, but only if the user is at the bottom
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      setIsAtBottom(isAtBottom);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Service Chat</h1>
        <Badge variant="outline" className="bg-primary text-primary-foreground">
          Support Center
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* User List */}
        <Card className="md:col-span-1 overflow-hidden">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <h3 className="text-sm font-medium mb-2">All Users ({filteredUsers.length})</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="px-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback
                      className={user.role === "ADMIN" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {user.username.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{user.username}</p>
                      <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <Badge variant="outline" className="bg-primary text-primary-foreground text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Section */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={selectedUser.role === "ADMIN" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {selectedUser.username.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground cursor-pointer" />
                  <Video className="h-5 w-5 text-muted-foreground cursor-pointer" />
                  <MoreVertical className="h-5 w-5 text-muted-foreground cursor-pointer" />
                </div>
              </div>
              <div
                ref={chatContainerRef}
                className="chat-messages flex-1 overflow-y-auto px-4 py-6 space-y-4 max-h-[calc(100vh-320px)]"
                onScroll={handleScroll}
              >
                {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === decodedToken?.id ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[75%] text-sm p-3 rounded-lg bg-muted text-black dark:bg-gray-830 dark:text-white">
              {message.content}
              <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1 text-right">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
                {/* Scroll to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t flex items-center gap-4">
                <Input
                  placeholder="Type your message"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <Button variant="secondary" onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <p className="p-4 text-center text-muted-foreground">Select a user to start chatting</p>
          )}
        </Card>
      </div>
    </div>
  );
}
