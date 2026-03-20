import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../css/Login.css";

export default function Login() {
    const navigate = useNavigate();
    const [studentEmail, setStudentEmail] = useState("")
    const [studentPassword, setStudentPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!studentEmail.includes("@")) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email: studentEmail.trim(),
            password: studentPassword,
        });

        if (error) {
            setErrorMessage(error.message);
            setIsSubmitting(false);
            return;
        }

        navigate("/home");
    }

    return (
        <div className="login-container">
            <section className="login-shell">
                <div className="login-brand-panel">
                    <p className="login-eyebrow">Student Workflow</p>
                    <h1>Keep assignments visible before they become urgent.</h1>
                    <p className="login-copy">
                        Sign in to manage due dates, track reminder delivery, and stay ahead of upcoming coursework in one planner.
                    </p>
                    <div className="login-feature-list">
                        <span>Priority tracking</span>
                        <span>Email reminders</span>
                        <span>Completion history</span>
                    </div>
                </div>
                <div className="login-card">
                    <h2>Welcome back</h2>
                    <p className="login-caption">Sign in to continue planning your academic week.</p>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input className="login-input" type="email" placeholder="Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                        <input className="login-input" type="password" placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                        <button className="login-btn" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging In..." : "Login"}
                        </button>
                    </form>
                    <p className="login-error">{errorMessage}</p>
                    <p className="login-switch">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </section>
        </div>
    )
}
