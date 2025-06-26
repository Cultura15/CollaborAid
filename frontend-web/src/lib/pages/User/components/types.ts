export interface User {
    id: string
    name: string
    email: string
    role: string
    avatar: string
  }
  
  export interface Task {
    id: number
    title: string
    description: string
    status: "Posted" | "Accepted" | "Completed"
    dueDate: string
    points: number
    responses?: number
    progress?: number
    category: string
  }
  
  export interface Message {
    id: number
    name: string
    avatar: string
    lastMessage: string
    time: string
    unread: boolean
    task: string
  }
  
  export interface Notification {
    id: number
    title: string
    description: string
    time: string
    icon: any
    read: boolean
  }
  