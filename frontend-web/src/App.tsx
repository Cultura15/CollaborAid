
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loginn from './pages/Login/Loginn';
import Register from './pages/Login/Register';
import ForgotPassword from './pages/Login/ForgotPassword';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import ProfilePage from './pages/Admin/Profile';
import Dashboard from './pages/User/Dashboard';
import AdminLogin from './pages/Login/AdminLogin';
import LoginChoice from './pages/Login/LoginChoice';
import Contact from './pages/Home/Contact';
import LearnMore from './pages/Home/LearnMore';



import "./index.css"; 

function App() {


  return (
    <Router>
    <Routes>
      <Route path="/login" element={<Loginn />} />
      <Route path="/admin-login" element={<AdminLogin/>} />
      <Route path="/login-choice" element={<LoginChoice/>} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/learn-more" element={<LearnMore />} />
      <Route path="/dashboard" element={<Admin />} />
      <Route path="/profile" element={<ProfilePage/>} />
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/user" element={<Dashboard/>} />
    </Routes>
  </Router>
  )
}

export default App
