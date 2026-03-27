import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProfileSetting from "./components/ProfileSetting";
import AssignmentDetail from "./components/AssignmentDetail";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { supabase } from "./lib/supabase";
import Dashboard from "./components/Dashboard";
import AddAssignment from "./components/AddAssignment";
import Calendar from "./components/Calendar";
import "./App.css";

function ProtectedRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function PublicOnlyRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      setIsAuthenticated(Boolean(data.session));
      setUserId(data.session?.user.id ?? "");
      setIsLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setUserId(session?.user.id ?? "");
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />

        {/* No NavBar on login/signup */}
        <Route element={<PublicOnlyRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Protected pages with NavBar */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Dashboard userId={userId} />} />
            <Route path="/calendar" element={<Calendar userId={userId} />} />
            <Route path="/add-assignment" element={<AddAssignment userId={userId} />} />
            <Route path="/assignment/:id" element={<AssignmentDetail userId={userId} />} />
            <Route path="/profile" element={<ProfileSetting />} />
          </Route>
        </Route>

        {/* Catch all unknown routes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;