import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProfileSetting from "./components/ProfileSetting";
import AssignmentDetail from "./components/AssignmentDetail";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

// NavBar only shows on these pages
function MainLayout() {
  return (
    <>
      <NavBar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* No NavBar on login/signup */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* NavBar shows on all these pages */}
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<ProfileSetting />} />
          <Route path="/assignment/:id" element={<AssignmentDetail />} />
          <Route path="/home" element={<div>Home Page</div>} />
          <Route path="/calendar" element={<div>Calendar Page</div>} />
          <Route path="/add-assignment" element={<div>Add Assignment Page</div>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;