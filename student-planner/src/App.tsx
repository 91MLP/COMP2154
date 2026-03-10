import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProfileSetting from "./components/ProfileSetting";

function App() {
  return (
    <BrowserRouter>
      <NavBar /> 
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          
          <Route path="/profile" element={<ProfileSetting />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;