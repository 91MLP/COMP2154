import { NavLink } from "react-router-dom";
import "../css/NavBar.css";

export default function NavBar() {
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
            </ul>
        </nav>
    );
}