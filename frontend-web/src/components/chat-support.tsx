"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, HelpCircle } from "lucide-react"

export const ChatSupport = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, newMessage])
      setNewMessage("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </div>
          </DialogTitle>
          <DialogDescription>Chat with our support team for assistance.</DialogDescription>
        </DialogHeader>

        <div className="h-[300px] overflow-y-auto p-2 space-y-2">
          {messages.map((message, index) => (
            <div key={index} className="text-sm bg-muted rounded-md p-2">
              {message}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="secondary" className="absolute top-2 right-2">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
