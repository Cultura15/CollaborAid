
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './context/ThemeProvider' // 👈 import your theme provider
import "./index.css";
import { NotificationProvider } from "@/context/NotificationContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <NotificationProvider>
    <ThemeProvider> {/* 👈 wrap App here */}
      <App />
    </ThemeProvider>
    </NotificationProvider>
  </StrictMode>
)
