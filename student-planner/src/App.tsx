import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProfileSetting from "./components/ProfileSetting";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

function App() {
  return (
    <BrowserRouter>
  
      <NavBar /> 
      
      <div className="main-content">
        <Routes>
    
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile" element={<ProfileSetting />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;