import { jwtDecode } from "jwt-decode";

// Define an interface for the decoded token to better handle the expected fields
interface DecodedToken {
  id?: number | string;
  sub?: string; // JWT standard subject field (often contains username or user ID)
  username?: string;
  email?: string;
  role?: string;
  bio?: string;
  // Add any other fields that might be in your token
  [key: string]: any; // Allow for other unknown fields
}

// Utility function to get the JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem("jwtToken");
}

// Utility function to decode the JWT token and get the user data
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    console.log("Decoding token:", token.substring(0, 20) + "...");
    const decoded = jwtDecode<DecodedToken>(token);
    console.log("Decoded token:", decoded);

    // Map fields that might be under different names
    const enhancedDecoded: DecodedToken = {
      ...decoded,
      username: decoded.username || decoded.sub || decoded.name,
    };

    return enhancedDecoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

// Utility function to check if the user is an admin
export const isAdmin = (): boolean => {
  const token = getToken();
  if (!token) {
    console.log("No token found");
    return false;
  }

  const decodedToken = decodeToken(token);
  console.log("Checking admin status:", decodedToken);

  // Check if the role property exists and is 'ADMIN'
  if (decodedToken && decodedToken.role) {
    console.log("User role:", decodedToken.role);
    return decodedToken.role === "ADMIN"; // True if admin, false if user
  }

  return false;
}

// Utility function to check if the user is authenticated (either user or admin)
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null;
}

// Utility function to get the role of the current user
export const getUserRole = (): string | null => {
  const token = getToken();
  if (token) {
    const decodedToken = decodeToken(token);
    return decodedToken?.role || null;
  }
  return null;
}

// Utility function to check if the logged-in user is an admin or a user
export const getUserType = (): string => {
  const role = getUserRole();
  if (role === "ADMIN") {
    return "Admin";
  } else if (role === "USER") {
    return "User";
  } else {
    return "Unknown";
  }
}
