import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../css/NavBar.css";

export default function NavBar() {
    const navigate = useNavigate();

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Error signing out", error);
            return;
        }

        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">📚 Study Planner</div>
            <ul className="navbar-links">
                <li>
                    <NavLink
                        to="/home"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/calendar"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        Calendar
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/add-assignment"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        Add Assignment
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                    >
                        Profile
                    </NavLink>
                </li>
                <li>
                    <button type="button" className="signout-btn" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </li>
            </ul>
        </nav>
    );
}
