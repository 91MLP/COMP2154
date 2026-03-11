import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../css/SignUp.css";

export default function SignUp() {
    const [studentEmail, setStudentEmail] = useState("")
    const [studentPassword, setStudentPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("")

    async function testConnection() {
        const { data, error } = await supabase.auth.signUp({ email: studentEmail, password: studentPassword })
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
        <div className="signup-container">
            <div className="signup-card">
                <h2>Sign Up</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <input className="signup-input" type="text" placeholder="Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                    <input className="signup-input" type="password" placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                    <button className="signup-btn" type="submit">Sign Up</button>
                </form>
                <p className="signup-error">{errorMessage}</p>
                <p className="signup-switch">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </div>
    )
}
