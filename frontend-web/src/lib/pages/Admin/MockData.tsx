"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { getToken, decodeToken } from "../JWTDecode/JWTDecode"

// Function to check if user is an admin
const isAdmin = () => {
  const token = getToken()
  if (!token) {
    console.log("No token found")
    return false
  }

  const decoded = decodeToken(token)
  console.log("Decoded token in isAdmin check:", decoded)

  if (decoded && decoded.role) {
    console.log("User role:", decoded.role)
    return decoded.role === "ADMIN"
  }

  return false
}

// Add Bearer token to axios request
const axiosWithAuth = () => {
  const token = getToken()
  console.log("JWT Token being sent:", token)
  return axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  })
}

export const fetchOpenTask = async () => {
  try {
    const response = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/open")
    return response.data
  } catch (error) {
    console.error("Error fetching open tasks:", error)
    return []
  }
}

export const fetchInProgressTask = async () => {
  try {
    const response = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/in-progress")
    return response.data
  } catch (error) {
    console.error("Error fetching in-progress tasks:", error)
    return []
  }
}

export const fetchDoneTask = async () => {
  try {
    const response = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/done")
    return response.data
  } catch (error) {
    console.error("Error fetching done tasks:", error)
    return []
  }
}

export const fetchUsers = async () => {
  try {
    if (!isAdmin()) {
      console.log("User is not admin, cannot fetch users");
      throw new Error("Unauthorized access");
    }

    // Fetch active users
    const activeResponse = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/auth/active-users");
    
    // Fetch inactive users
    const inactiveResponse = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/auth/inactive-users");

    // Return both active and inactive users
    return {
      activeUsers: activeResponse.data,
      inactiveUsers: inactiveResponse.data
    };
    
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      activeUsers: [],
      inactiveUsers: []
    }; // Return empty arrays in case of error
  }
}

export const fetchTasks = async () => {
  try {
    const response = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/all")
    return response.data
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

// Hook to fetch user details
export function useUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const getUsers = async () => {
      const { activeUsers, inactiveUsers } = await fetchUsers()
    
      // Tag each user explicitly with status
      const taggedActiveUsers = activeUsers.map(user => ({ ...user, status: "active" }))
      const taggedInactiveUsers = inactiveUsers.map(user => ({ ...user, status: "inactive" }))
    
      const combinedUsers = [...taggedActiveUsers, ...taggedInactiveUsers]
      setUsers(combinedUsers)
    }
    

    getUsers()
  }, [])

  return users
}


export function useTasks() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const getTasks = async () => {
      const data = await fetchTasks()
      // No need to filter "INACTIVE" tasks again, assuming backend already handles it
      setTasks(data)  // Set all tasks as they are already filtered on the backend
    }

    getTasks()
  }, [])

  return tasks
}



export function useTaskOpen() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const getTasks = async () => {
      const data = await fetchOpenTask()
      setTasks(data)
    }

    getTasks()
  }, [])

  return tasks
}

export function useTaskInProgress() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const getTasks = async () => {
      const data = await fetchInProgressTask()
      setTasks(data)
    }

    getTasks()
  }, [])

  return tasks
}

export function useTaskDone() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const getTasks = async () => {
      const data = await fetchDoneTask()
      setTasks(data)
    }

    getTasks()
  }, [])

  return tasks
}

export function useDashboardData() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", changeType: "positive" },
    { title: "Active Tasks", value: "0", change: "+0%", changeType: "positive" },
    { title: "Completed Tasks", value: "0", change: "+0%", changeType: "positive" },
    { title: "WALA PA", value: "0", change: "0%", changeType: "positive" },
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is admin before fetching data
        if (!isAdmin()) {
          console.log("User is not admin, not fetching dashboard data")
          return
        }

        console.log("Fetching dashboard data as admin")

        // Fetch users
        const usersResponse = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/auth/all")
        const usersCount = usersResponse.data.length

        // Fetch open tasks
        const openTasksResponse = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/open")
        const openTasksCount = openTasksResponse.data.length

        // Fetch done tasks
        const doneTasksResponse = await axiosWithAuth().get("https://it342-g5-collaboraid.onrender.com/api/task/done")
        const doneTasksCount = doneTasksResponse.data.length

        // Update stats dynamically
        setStats((prevStats) => [
          { ...prevStats[0], value: usersCount.toString() },
          { ...prevStats[1], value: openTasksCount.toString() },
          { ...prevStats[2], value: doneTasksCount.toString() },
          { ...prevStats[3], value: "0", change: "0%", changeType: "positive" },
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])





  return { stats }
}

// Messaging services for admin chat
export const fetchConversation = async (adminId: number, userId: number) => {
  try {
    const response = await axiosWithAuth().get(`https://it342-g5-collaboraid.onrender.com/api/messages/conversation/${adminId}/${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return []
  }
}

export const sendMessage = async (messagePayload: any) => {
  try {
    const response = await axiosWithAuth().post("https://it342-g5-collaboraid.onrender.com/api/messages/send", messagePayload)
    return response.data
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}


