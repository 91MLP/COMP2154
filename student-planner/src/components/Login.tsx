import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../css/Login.css";

export default function Login() {
    const [studentEmail, setStudentEmail] = useState("")
    const [studentPassword, setStudentPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("")

    async function testConnection() {
        const { data, error } = await supabase.auth.signInWithPassword({ email: studentEmail, password: studentPassword })
        console.log("data", data)
        console.log("error", error)
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!studentEmail.includes("@")) { setErrorMessage("Email does not accepted"); return; }
        setErrorMessage("")
        testConnection()
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Login</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input className="login-input" type="text" placeholder="Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                    <input className="login-input" type="password" placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                    <button className="login-btn" type="submit">Login</button>
                </form>
                <p className="login-error">{errorMessage}</p>
                <p className="login-switch">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    )
}
