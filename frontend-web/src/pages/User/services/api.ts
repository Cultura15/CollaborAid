"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const api = axios.create({
  baseURL: "https://it342-g5-collaboraid.onrender.com/api",
})

// Custom hook for fetching dashboard data
export const useDashboardData = () => {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", changeType: "positive" },
    { title: "Active Tasks", value: "0", change: "+0%", changeType: "positive" },
    { title: "Completed Tasks", value: "0", change: "+0%", changeType: "positive" },
  ])

  useEffect(() => {
    // Mock data for demonstration
    setStats([
      { title: "Total Users", value: "150", change: "+10%", changeType: "positive" },
      { title: "Active Tasks", value: "35", change: "+5%", changeType: "positive" },
      { title: "Completed Tasks", value: "115", change: "+15%", changeType: "positive" },
    ])
  }, [])

  return { stats }
}

// Custom hook for fetching tasks in progress
export const useTaskInProgress = (refreshKey) => {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Mock data for demonstration
    const mockTasks = [
      {
        id: 1,
        title: "Help with Calculus Assignment",
        user: { username: "john_doe" },
        acceptedBy: { username: "jane_doe" },
        status: "In Progress",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Physics Lab Report Review",
        user: { username: "alice_smith" },
        acceptedBy: { username: "bob_johnson" },
        status: "In Progress",
        timestamp: new Date().toISOString(),
      },
    ]
    setTasks(mockTasks)
  }, [refreshKey])

  return tasks
}

// Custom hook for fetching tasks
export const useTasks = () => {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Mock data for demonstration
    const mockTasks = [
      {
        id: 1,
        title: "Help with Calculus Assignment",
        user: { username: "john_doe" },
        status: "Open",
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Physics Lab Report Review",
        user: { username: "alice_smith" },
        status: "Open",
        timestamp: new Date().toISOString(),
      },
    ]
    setTasks(mockTasks)
  }, [])

  return tasks
}

// Function to fetch active and inactive users
export const fetchUsers = async () => {
  try {
    // Mock API call for demonstration
    const activeUsers = [
      { id: 1, username: "john_doe" },
      { id: 2, username: "jane_doe" },
    ]
    const inactiveUsers = [{ id: 3, username: "jim_beam" }]

    return { activeUsers, inactiveUsers }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { activeUsers: [], inactiveUsers: [] }
  }
}
