import { jwtDecode } from "jwt-decode"



// Utility function to get the JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem("jwtToken")
}

// Utility function to decode the JWT token and get the user data
export const decodeToken = (token: string): any => {
  try {
    console.log("Decoding token:", token.substring(0, 20) + "...")
    const decoded = jwtDecode(token)
    console.log("Decoded token:", decoded)
    return decoded
  } catch (error) {
    console.error("Invalid token", error)
    return null
  }
}

// Utility function to check if the user is an admin
export const isAdmin = (): boolean => {
  const token = getToken()
  if (!token) {
    console.log("No token found")
    return false
  }

  const decodedToken = decodeToken(token)
  console.log("Checking admin status:", decodedToken)

  // Check if the role property exists and is 'ADMIN'
  if (decodedToken && decodedToken.role) {
    console.log("User role:", decodedToken.role)
    return decodedToken.role === "ADMIN"
  }

  return false
}

// Utility function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return token !== null
}

